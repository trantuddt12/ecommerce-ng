import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  it('skips an identical toast that is still visible', () => {
    service.error('Thanh toan chua san sang');
    service.error('Thanh toan chua san sang');

    expect(service.notifications().length).toBe(1);
  });

  it('keeps toasts with different message or level', () => {
    service.error('Loi A');
    service.error('Loi B');
    service.info('Loi A');

    expect(service.notifications().length).toBe(3);
  });

  it('allows the same toast again after it is dismissed', () => {
    service.error('Loi A');
    service.dismiss(service.notifications()[0].id);
    service.error('Loi A');

    expect(service.notifications().length).toBe(1);
  });
});
