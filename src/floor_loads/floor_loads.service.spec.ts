import { describe, expect, it, vi } from 'vitest';
import { FloorLoadsService } from './floor_loads.service';
import { ServiceStatus } from '../entities/load.entity';

describe('LoadsCalculationService', () => {
  it('should publish current draft without requiring title/image/video in request body', async () => {
    const loadRepository = {
      findOne: vi.fn().mockResolvedValue({
        id: 42,
        creator_id: 1,
        status: ServiceStatus.Draft,
      }),
      update: vi.fn().mockResolvedValue(undefined),
    };

    const service = new FloorLoadsService(
      loadRepository as any,
      { findOne: vi.fn() } as any,
      { findOne: vi.fn() } as any,
      { uploadFile: vi.fn() } as any,
    );

    await service.publishCurrentDraftByUser(1, {
      description: 'Новая мебельная нагрузка',
      standard_load: 120,
      reliability_coefficient: '0.9',
    });

    expect(loadRepository.findOne).toHaveBeenCalledWith({
      where: {
        creator_id: 1,
        status: ServiceStatus.Draft,
      },
      order: { id: 'DESC' },
    });

    expect(loadRepository.update).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        description: 'Новая мебельная нагрузка',
        standard_load: 120,
        reliability_coefficient: '0.9',
        status: ServiceStatus.Published,
      }),
    );
  });
});
