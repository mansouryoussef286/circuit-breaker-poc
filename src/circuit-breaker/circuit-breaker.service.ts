import { Injectable, Logger } from '@nestjs/common';
import CircuitBreaker, { Options } from 'opossum';

const DEFAULT_OPOSSUM_OPTIONS: Options = {
	timeout: 1500,
	errorThresholdPercentage: 50,
	rollingCountTimeout: 10000,
	volumeThreshold: 3,
	resetTimeout: 20000,
};

@Injectable()
export class CircuitBreakerService {
	// Storage for all circuit instances
	private readonly circuitMap = new Map<string, CircuitBreaker>();

	public getCircuit(
		key: string,
		customOptions: Partial<Options> = {},
	): CircuitBreaker {
		if (this.circuitMap.has(key)) {
			return this.circuitMap.get(key)!;
		}

		const options: Options = {
			...DEFAULT_OPOSSUM_OPTIONS,
			...customOptions,
			name: key, // Ensure the name is the unique key
		};

		console.log(`👌Creating new Circuit Breaker for: ${key}`);

		// The command function is defined in fire method
		const circuit = new CircuitBreaker(
			async (fn: () => Promise<any>) => fn(),
			options,
		);

		// circuit.fallback((err) => {
		// // will always fire when the fire fiunction rejects on the circuit
		// });

		// Add logging/monitoring listeners (centralized)
		circuit.on('open', () => console.log(`⏹️ Circuit OPEN for ${key}`));
		circuit.on('close', () => console.log(`▶️ Circuit CLOSED for ${key}`));
		circuit.on('halfOpen', () =>
			console.log(`⏯️ Circuit HALF-OPEN for ${key}`),
		);
		this.circuitMap.set(key, circuit);
		return circuit;
	}

	Externalfallback(circuit: CircuitBreaker, originalError: any) {
		console.log(
			`fallback triggered circuit: [${circuit.name}] - open state: ${circuit.opened}`,
		);

		//throw the original error if the circuit is not open (to distinguish between real errors and open circuit)
		if (!circuit.opened) throw originalError;

		const error = new Error(
			`✖️ Circuit  [${circuit.name}] is open and call was blocked.✖️`,
		);
		(error as any).code = 'EOPEN';
		throw error;
	}

	FireCircuit(externalCall: () => Promise<any>, circuitKey): Promise<any> {
		const circuit = this.getCircuit(circuitKey);

		return circuit
			.fire(() => {
				// console.log('▶️  ExecutionFn START (GET)');
				// this callback only runs when the circuit is closed or half-open
				return externalCall();
			})
			.then((res) => {
				console.log(`🟢 Circuit ${circuit.name} SUCCESS`);
				return res;
			})
			.catch((err) => {
				console.log(`🔴 Circuit ${circuit.name} FAILURE`);
				// throw err;
				this.Externalfallback(circuit, err);
				return null;
			});
	}
}
