import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('/external-todos')
	async getExternalTodos() {
		return this.appService.fetchExternalTodos();
	}

	@Get('/external-posts')
	async getExternalPosts() {
		return this.appService.fetchExternalPosts();
	}

	@Get('/toggle-todo-erroring')
	toggleTodoErroring() {
		return { message: this.appService.toggleTodoErroringCalls() };
	}

	@Get('/toggle-post-erroring')
	togglePostErroring() {
		return { message: this.appService.togglePostErroringCalls() };
	}
}
