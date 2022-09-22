import { jest } from '@jest/globals';
import { faker } from '@faker-js/faker';

import repository from '../../src/repositories/voucherRepository';
import service from '../../src/services/voucherService';

describe('VoucherService Unit Tests', () => {

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('Should create a voucher', async() => {

    const voucher = {
      code: faker.animal.dog(),
      discount: Math.floor(Math.random() * 100) + 1
    }

    jest.spyOn(repository, 'getVoucherByCode').mockResolvedValueOnce(null);

    jest.spyOn(repository, 'createVoucher').mockResolvedValueOnce({
      id: Math.floor(Math.random() * 10000) + 1000,
      used: false,
      ...voucher
    });

    await service.createVoucher(voucher.code, voucher.discount);

    expect(repository.createVoucher).toBeCalled();

  });

  it('Should not create a duplicated voucher', async() => {

    const voucher = {
      id: Math.floor(Math.random() * 10000) + 1000,
      used: false,
      code: faker.animal.dog(),
      discount: Math.floor(Math.random() * 100) + 1
    }

    jest.spyOn(repository, 'getVoucherByCode').mockResolvedValueOnce({
      ...voucher
    });

    jest.spyOn(repository, 'createVoucher').mockResolvedValueOnce({
      ...voucher
    });

    try {
      await service.createVoucher(voucher.code, voucher.discount);
    } catch (err) {
      expect(err.message).toBe('Voucher already exist.');
    }

    expect(repository.createVoucher).not.toBeCalled();

  });
  
  it('Should apply voucher', async() => {
    const voucher = {
      id: Math.floor(Math.random() * 10000) + 1000,
      used: false,
      code: faker.animal.dog(),
      discount: Math.floor(Math.random() * 100) + 1
    };

    const amount = Math.floor(Math.random() * 10000) + 100;
    const finalAmount = amount - amount * (voucher.discount / 100);

    jest.spyOn(repository, 'getVoucherByCode').mockResolvedValueOnce({
      ...voucher
    });
    
    jest.spyOn(repository, 'useVoucher').mockResolvedValueOnce({
      used:true,
      ...voucher
    });

    const result = await service.applyVoucher(voucher.code, amount);

    expect(result.amount).toBe(amount);
    expect(result.discount).toBe(voucher.discount);
    expect(result.finalAmount).toBe(finalAmount);
    expect(result.applied).toBe(true);

    expect(repository.useVoucher).toBeCalled();
  });
    
  it('Should not apply voucher for code does not exist', async() => {
    const voucher = {
      id: Math.floor(Math.random() * 10000) + 1000,
      used: false,
      code: faker.animal.dog(),
      discount: Math.floor(Math.random() * 100) + 1
    };

    const amount = Math.floor(Math.random() * 10000) + 100;
    
    jest.spyOn(repository, 'getVoucherByCode').mockResolvedValueOnce(null);
    
    jest.spyOn(repository, 'useVoucher').mockResolvedValueOnce({
      used: true,
      ...voucher
    });

    try {
      await service.applyVoucher(voucher.code, amount);
    } catch (err) {
      expect(err.message).toBe('Voucher does not exist.');
    }

    expect(repository.useVoucher).not.toBeCalled();
  });

  it('Should not apply voucher for voucher already used', async() => {
    const voucher = {
      id: Math.floor(Math.random() * 10000) + 1000,
      used: true,
      code: faker.animal.dog(),
      discount: Math.floor(Math.random() * 100) + 1
    };

    const amount = Math.floor(Math.random() * 10000) + 100;
    const finalAmount = amount;

    jest.spyOn(repository, 'getVoucherByCode').mockResolvedValueOnce({
      ...voucher
    });
    
    jest.spyOn(repository, 'useVoucher').mockResolvedValueOnce({
      used:true,
      ...voucher
    });

    const result = await service.applyVoucher(voucher.code, amount);

    expect(result.amount).toBe(amount);
    expect(result.discount).toBe(voucher.discount);
    expect(result.finalAmount).toBe(finalAmount);
    expect(result.applied).toBe(false);

    expect(repository.useVoucher).not.toBeCalled();
  });

  it('Should not apply voucher for amount less than minimun', async() => {
    const voucher = {
      id: Math.floor(Math.random() * 10000) + 1000,
      used: false,
      code: faker.animal.dog(),
      discount: Math.floor(Math.random() * 100) + 1
    };

    const amount = Math.floor(Math.random() * 99) + 1;
    const finalAmount = amount;

    jest.spyOn(repository, 'getVoucherByCode').mockResolvedValueOnce({
      ...voucher
    });
    
    jest.spyOn(repository, 'useVoucher').mockResolvedValueOnce({
      used:true,
      ...voucher
    });

    const result = await service.applyVoucher(voucher.code, amount);

    expect(result.amount).toBe(amount);
    expect(result.discount).toBe(voucher.discount);
    expect(result.finalAmount).toBe(finalAmount);
    expect(result.applied).toBe(false);

    expect(repository.useVoucher).not.toBeCalled();
  });

});