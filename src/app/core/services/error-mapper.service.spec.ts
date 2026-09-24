import { HttpErrorResponse } from '@angular/common/http';
import { AppError } from '../models/app-error.model';
import { ErrorMapperService } from './error-mapper.service';

describe('ErrorMapperService', () => {
  let mapper: ErrorMapperService;

  beforeEach(() => {
    mapper = new ErrorMapperService();
  });

  it('maps backend ErrorMessage body to its error text', () => {
    const response = new HttpErrorResponse({
      status: 400,
      error: { error: 'Thanh toan chua san sang', status: '400 BAD_REQUEST' },
    });

    const mapped = mapper.map(response);

    expect(mapped.type).toBe('validation');
    expect(mapped.statusCode).toBe(400);
    expect(mapped.message).toBe('Thanh toan chua san sang');
  });

  it('returns an already mapped AppError unchanged', () => {
    const appError = mapper.map(new HttpErrorResponse({
      status: 400,
      error: { error: 'Thanh toan chua san sang' },
    }));

    const remapped = mapper.map(appError);

    expect(remapped).toBe(appError);
    expect(remapped.message).toBe('Thanh toan chua san sang');
  });

  it('falls back to unknown for non-http errors', () => {
    const mapped: AppError = mapper.map(new Error('boom'));

    expect(mapped.type).toBe('unknown');
    expect(mapped.message).toBe('Da xay ra loi khong xac dinh.');
  });
});
