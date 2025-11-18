import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker.service';
import { CircuitBreakerHttpService } from './circuit-breaker/CircuitBreakerHttpService.service';

//for docker deployment
const getEnvPath = (nodeEnv?: string): string => {
	return nodeEnv === 'production' ? '.env.prod' : '.env.dev';
};
const envFilePath = getEnvPath(process.env.NODE_ENV);
//add interceptor globally
@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: envFilePath,
			isGlobal: true,
		}),
		HttpModule,
	],
	controllers: [AppController],
	providers: [AppService, CircuitBreakerService, CircuitBreakerHttpService],
})
export class AppModule {}
