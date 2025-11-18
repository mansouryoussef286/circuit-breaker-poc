import { Injectable } from '@nestjs/common';
import { CircuitBreakerHttpService } from './circuit-breaker/CircuitBreakerHttpService.service';

@Injectable()
export class AppService {
	isTodoError: boolean = false;
	isPostError: boolean = false;
	constructor(private circuitBreakerHttpService: CircuitBreakerHttpService) {}
	getHello(): string {
		return 'Hello World!';
	}

	async fetchExternalTodos(): Promise<any> {
		// Simulate a third-party HTTP call
		let response: any;
		try {
			response = await this.circuitBreakerHttpService.get(
				`https://jsonplaceholder.typicode.com/todos/${this.getTodoRandomNumber()}`,
				'TodosCircuit',
			);
			console.log('✅Service: fetched todo item:', response.data);
		} catch (error) {
			console.error(
				'❌Service: Error fetching todo items:',
				error.message.substring(0, 100),
			);
		}

		return response?.data || 'errored out';
	}

	async fetchExternalPosts(): Promise<any> {
		// Simulate a third-party HTTP call
		let response: any;
		try {
			response = await this.circuitBreakerHttpService.get(
				`https://jsonplaceholder.typicode.com/posts/${this.getPostRandomNumber()}`,
				'postsCircuit',
			);
			console.log('✅Service: fetched post item:', response.data);
		} catch (error) {
			console.error(
				'❌Service: Error fetching posts:',
				error.message.substring(0, 100),
			);
		}
		return response?.data || 'errored out';
	}

	toggleTodoErroringCalls() {
		this.isTodoError = !this.isTodoError;
		return this.isTodoError
			? 'Now erroring calls.'
			: 'Stopped erroring calls.';
	}

	getTodoRandomNumber() {
		let min = Math.ceil(this.isTodoError ? 5000 : 1);
		let max = Math.floor(this.isTodoError ? 6000 : 100);

		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	togglePostErroringCalls() {
		this.isPostError = !this.isPostError;
		return this.isPostError
			? 'Now erroring calls.'
			: 'Stopped erroring calls.';
	}

	getPostRandomNumber() {
		let min = Math.ceil(this.isPostError ? 5000 : 1);
		let max = Math.floor(this.isPostError ? 6000 : 100);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}
