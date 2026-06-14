import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Wraps every successful response in the { success, data } envelope. */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, { success: true; data: T }> {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<{ success: true; data: T }> {
    return next.handle().pipe(map((data) => ({ success: true as const, data })));
  }
}
