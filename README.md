# 🐰 Circuit Breaker Proof of Concept API

<details open>
<summary><h2>💡 Project Overview</h2></summary>

This repository is a small NestJS proof-of-concept demonstrating a centralized Circuit Breaker integration using the `opossum` library. The project wraps outbound HTTP calls with a reusable circuit-breaker service and an HTTP helper so you can protect third-party calls, track circuit states, and gracefully handle failures ([**Requests flow**](#app-flow)).

Key ideas implemented:

- Centralized circuit management with configurable options (`src/circuit-breaker/circuit-breaker.service.ts`).
- A small `CircuitBreakerHttpService` wrapper that uses the centralized service for HTTP `get` requests.
- Simple demo endpoints in `src/app.controller.ts` showing normal and failure/error-mode flows.

</details>

<details>
<summary><h2>✨ Features</h2></summary>

- Built with `NestJS`.
- Uses `opossum` for circuit breaker patterns with sensible defaults in `CircuitBreakerService`.
- `CircuitBreakerHttpService` demonstrates how to wrap HTTP calls with a circuit.
- Demo endpoints to simulate normal, slow, or erroring behaviour for external services.
- Logging hooks for `open`, `close`, and `halfOpen` circuit events.

</details>

<details>
<summary><h2>🚀 Getting Started</h2></summary>

Prerequisites:

- `node` (v18+ recommended)
- `npm` or `pnpm`
- (Optional) `docker` / `docker-compose` if you want to run in containers

Install dependencies:

```bash
npm install
```

Open the project in your editor and review the important files:

- `src/circuit-breaker/circuit-breaker.service.ts` — centralized circuit creation and lifecycle handlers.
- `src/circuit-breaker/CircuitBreakerHttpService.service.ts` — HTTP wrapper that uses the circuit service.
- `src/app.service.ts` and `src/app.controller.ts` — demo endpoints and toggles to exercise the circuits.

</details>

<details>
<summary><h2>🏃 Run the Project</h2></summary>

Run in development (watch mode):

```bash
npm run start
```

Build and run production:

```bash
npm run build
npm run start:prod
```

*Run with Docker Compose (development):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Run with Docker Compose (production overlay):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

</details>

<details open>
<summary><h2>🔁 Request Flow Cases (How to exercise the POC)</h2></summary>
<img style="max-height:500px;" src="/ReadmeAssets/circuit breaker.png" alt="requests flow through the circuit" id="request-flow">

This POC exposes endpoints to demonstrate different circuit behaviours. The main endpoints are in `src/app.controller.ts`:

- `GET /external-todos` — fetches a single todo from `jsonplaceholder.typicode.com` using the `TodosCircuit` circuit.
- `GET /external-posts` — fetches a single post using the `postsCircuit` circuit.
- `GET /toggle-todo-erroring` — toggles the todo call behavior to force slow/timeout responses (simulates unreliable downstream).
- `GET /toggle-post-erroring` — toggles the post call behavior similarly.

Typical scenarios to try:

- Normal (closed): Call `/external-todos` repeatedly while toggle is off. Responses should return successful payloads.
- Slow / Timeout: Toggle the endpoint by calling `/toggle-todo-erroring`, then call `/external-todos` — the service simulates error responses which will cause `opossum` timeouts and errors.
- Circuit Open: After repeated failures according to the opossum thresholds, the circuit will open and subsequent calls will be blocked immediately (fast-fail) until the reset timeout elapses.
- Half-Open: After the reset timeout, `opossum` will allow a trial request (half-open). If it succeeds, the circuit will close; otherwise it will re-open.

Quick CURL examples (when server is running on `http://127.0.0.1:3005`):

```bash
# Normal call
curl http://127.0.0.1:3005/external-todos

# Toggle to erroring block calls
curl http://127.0.0.1:3005/toggle-todo-erroring

# Call again to see failures / circuit behaviour
curl http://127.0.0.1:3005/external-todos
```

Watch the server console — the POC prints lifecycle events such as `Circuit OPEN`, `Circuit CLOSED`, and `Circuit HALF-OPEN` for each circuit.

</details>

<details>
<summary><h2>🧭 Implementation Notes</h2></summary>

- `CircuitBreakerService` stores circuit instances in a map keyed by string; this avoids creating duplicate circuits and centralizes event listeners.
- Default `opossum` options are defined (timeout, errorThresholdPercentage, rollingCountTimeout, volumeThreshold, resetTimeout) and can be overridden per-circuit.
- `CircuitBreakerHttpService.get()` wraps an `HttpService` call with a function that the circuit executes via `FireCircuit`.
- `AppService` toggles the randomness to simulate healthy and unhealthy downstream services; the toggles change generated ID ranges so the `jsonplaceholder` call may hang or error.

</details>

<details>
<summary><h2>🔮 Future Improvements</h2></summary>

- Add method-level decorator wiring so the `@CircuitBreaker()` decorator automatically applies the circuit.
- Implement request-level metrics and expose them (Prometheus metrics or a health dashboard).
- Add a circuit fallback implementation that returns cached or degraded responses instead of throwing.
- Add unit and e2e tests around failure scenarios and circuit transitions.
- Add configuration via `.env` and document environment variables for production tuning.

</details>

<details>
<summary><h2>📚 Resources & References</h2></summary>

- Opossum (Circuit Breaker library): https://nodeshift.github.io/opossum/
- NestJS: https://docs.nestjs.com/
- Example placeholder API used by the demo: https://jsonplaceholder.typicode.com/

Files to review for implementation:

- `src/circuit-breaker/circuit-breaker.service.ts`
- `src/circuit-breaker/CircuitBreakerHttpService.service.ts`
- `src/app.service.ts` and `src/app.controller.ts`

</details>
