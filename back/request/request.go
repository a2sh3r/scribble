package request

import (
	"app/log"
	"context"
	"sync"
	"time"
)

type Request func() error

type RequestHandler struct {
	requests            chan Request
	lowPriorityRequests chan Request
	ctx                 context.Context
	cancel              context.CancelFunc
	mu                  sync.Mutex
	isProcessing        bool
}

func NewRequestHandler() (*RequestHandler, error) {
	ctx, cancel := context.WithCancel(context.Background())
	requestApp := RequestHandler{
		requests:            make(chan Request),
		lowPriorityRequests: make(chan Request),
		ctx:                 ctx,
		cancel:              cancel,
	}

	return &requestApp, nil
}

// HandleRequest добавляет запрос в очередь
func (app *RequestHandler) HandleRequest(req Request) {
	app.mu.Lock()
	defer app.mu.Unlock()

	if !app.isProcessing {
		log.App.Warn("Обработка не запущена, запрос не может быть добавлен.")
		return
	}

	go func() {
		app.requests <- req
	}()
}

// HandleLowPriorityRequest добавляет низко-приоритетный запрос в очередь
func (app *RequestHandler) HandleLowPriorityRequest(req Request) {
	app.mu.Lock()
	defer app.mu.Unlock()

	if !app.isProcessing {
		log.App.Warn("Обработка не запущена, низко-приоритетный запрос не может быть добавлен.")
		return
	}

	go func() {
		app.lowPriorityRequests <- req
	}()
}

// ProcessRequests запускает обработку из канала. Между выполнением функций будет выполнена обязательная пауза pause
// Для добавление запросов в очередь, передайте запрос в HandleRequest или HandleLowPriorityRequest
func (app *RequestHandler) ProcessRequests(pause time.Duration) {
	app.mu.Lock()
	if app.isProcessing {
		log.App.Error("Невозможно запустить обработку запросов ProcessRequests. Обработка уже запущена.")
		app.mu.Unlock()
		return
	}
	app.isProcessing = true
	app.mu.Unlock()
	for {
		select {
		case <-app.ctx.Done():
			app.isProcessing = false
			return
		case req := <-app.requests:
			err := req()
			if err != nil {
				log.App.Error("Ошибка при выполнении запроса: ", err)
			}
		case req := <-app.lowPriorityRequests:
			err := req()
			if err != nil {
				log.App.Error("Ошибка при выполнении низко приоритетного запроса: ", err)
			}
		}
		time.Sleep(pause)
	}
}

// ProcessRequests запускает обработку из канала. Если между концом выполнения запросы и начало нового не успеет пройти minPause времение,
// то пауза будет увеличина по правилу HandleLowPriorityRequest. defaultPause - стандартная пауза, после конца запроса.
// Для добавление запросов в очередь, передайте запрос в HandleRequest или HandleLowPriorityRequest
func (app *RequestHandler) ProcessRequestsWithDynamicPause(defaultPause time.Duration, incrementPause func(currentPause time.Duration) time.Duration) {
	app.mu.Lock()
	if app.isProcessing {
		log.App.Error("Невозможно запустить обработку запросов ProcessRequestsWithDynamicPause. Обработка уже запущена.")
		app.mu.Unlock()
		return
	}
	app.isProcessing = true
	app.mu.Unlock()

	currentPause := defaultPause
	consecutiveRequests := 0

	for {
		select {
		case <-app.ctx.Done():
			app.isProcessing = false
			return
		case req := <-app.requests:
			consecutiveRequests++
			err := req()
			if err != nil {
				log.App.Error("Ошибка при выполнении запроса: ", err)
			}
		case req := <-app.lowPriorityRequests:
			consecutiveRequests++
			err := req()
			if err != nil {
				log.App.Error("Ошибка при выполнении низко приоритетного запроса: ", err)
			}
		default:
			// Если нет запросов, сбрасываем счетчик и паузу
			consecutiveRequests = 0
			currentPause = defaultPause
			time.Sleep(defaultPause)
			continue
		}

		// Увеличиваем паузу, если обработано несколько запросов подряд
		if consecutiveRequests > 1 {
			currentPause = incrementPause(currentPause)
		} else {
			currentPause = defaultPause
		}

		time.Sleep(currentPause)
	}
}

// StopProcessing останавливает обработку запросов
func (app *RequestHandler) StopProcessing() {
	app.cancel() // Отменяем контекст
	app.mu.Lock()
	app.isProcessing = false
	app.mu.Unlock()
}

// incrementPause - пример factor 1.5 увеличение времени на 50% после каждой "взрывной итерации"
func IncrementPause(factor float64, maxPause time.Duration) func(currentPause time.Duration) time.Duration {
	return func(currentPause time.Duration) time.Duration {
		basePause := time.Second
		newPause := time.Duration(float64(currentPause) * factor)
		if newPause < basePause {
			return basePause
		}
		if newPause > maxPause {
			return maxPause
		}
		return newPause
	}
}
