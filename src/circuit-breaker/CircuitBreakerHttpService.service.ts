import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CircuitBreakerHttpService {
	constructor(
		private http: HttpService,
		private circuitBreakerService: CircuitBreakerService,
	) {}

	async get(url: string, circuitName: string, config?: any): Promise<any> {
		const fnToCall = () => {
			const response = this.http.get(url, config);
			return lastValueFrom(response);
		};
		return this.circuitBreakerService.FireCircuit(fnToCall, circuitName);
	}

	// Implement other HTTP methods (post, put, delete) similarly...
}
