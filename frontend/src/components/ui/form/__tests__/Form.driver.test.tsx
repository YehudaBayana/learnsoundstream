import { FormDriver } from './Form.driver';

describe('Form', () => {
  let driver: FormDriver;

  beforeEach(() => {
    driver = new FormDriver();
  });

  it('uses the requested gap and root hook', () => {
    driver.render({ dataHook: 'playlist-form', gap: 4 });
    expect(driver.getClassName('playlist-form')).toContain('gap-4');
  });

  it('prevents native submission and calls the submit handler', () => {
    const onSubmit = jest.fn();
    driver.render({ onSubmit });
    driver.submit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});