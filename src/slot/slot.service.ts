// slotservice.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SlotDto } from './dto/slot.dto';
import { CourtService } from 'src/court/court.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TimeDto } from './dto/time.dto';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween'; // Import isBetween plugin
import { DAY } from '@prisma/client';
import minMax from 'dayjs/plugin/minMax';
import issameorbefore from 'dayjs/plugin/isSameOrBefore';
import issameorafter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(issameorbefore);
dayjs.extend(issameorafter);
dayjs.extend(minMax);

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween); // Extend Day.js with isBetween

// Set default time zone to Pakistan Standard Time
dayjs.tz.setDefault('Asia/Karachi');

@Injectable()
export class SlotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courtService: CourtService,
  ) {}

  timevalidator(dto: TimeDto): boolean {
    const { start_time, end_time } = dto;

    const startTime = dayjs(start_time);
    const endTime = dayjs(end_time);

    if (!startTime.isValid() || !endTime.isValid()) {
      console.error('Invalid date-time format');
      return false;
    }

    if (!startTime.isBefore(endTime)) {
      console.error('Start time must be before end time');
      return false;
    }

    if (startTime.isBefore(dayjs())) {
      console.error('Start time must be in the future');
      return false;
    }

    const duration = endTime.diff(startTime, 'minute');
    if (duration < 60) {
      console.error('Slot must be at least 60 minutes');
      return false;
    }

    return true;
  }

  async checkOverlappingSlot(
    dto: SlotDto,
    excludeSlotId?: string,
  ): Promise<boolean> {
    try {
      const { court_id, start_time, end_time } = dto;
      const overlappingSlot = await this.prisma.slot.findFirst({
        where: {
          court_id,
          id: excludeSlotId ? { not: excludeSlotId } : undefined, // Exclude current slot
          AND: [
            { start_time: { lt: end_time } },
            { end_time: { gt: start_time } },
          ],
        },
      });

      if (overlappingSlot) {
        console.error(
          `Slot overlap detected for court ${court_id} between ${start_time} and ${end_time}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to check overlapping slot', error.message);
      throw new BadRequestException(
        'Failed to check overlapping slot',
        error.message,
      );
    }
  }

  async checkCourtAvailability(dto: SlotDto): Promise<boolean> {
    const { court_id, start_time, end_time } = dto;

    try {
      const startTime = dayjs.tz(start_time, 'Asia/Karachi');
      const endTime = dayjs.tz(end_time, 'Asia/Karachi');

      // Generate a list of dates covered by the slot
      const dates = [];
      let currentDate = startTime.startOf('day');
      while (
        currentDate.isBefore(endTime) ||
        currentDate.isSame(endTime, 'day')
      ) {
        dates.push(currentDate.clone());
        currentDate = currentDate.add(1, 'day');
      }

      for (const date of dates) {
        const dayName = date.format('dddd').toLowerCase() as DAY;

        // Fetch all availabilities for the day
        const availabilities = await this.prisma.court_Availability.findMany({
          where: {
            court_id,
            day: dayName,
          },
        });

        if (!availabilities || availabilities.length === 0) {
          console.error(`Court is not available on ${dayName}`);
          return false;
        }

        // Determine the slot's portion on this day
        const slotStart = dayjs.max(startTime, date);
        const slotEnd = dayjs.min(endTime, date.endOf('day'));

        // Merge availability intervals for the day
        const availabilityIntervals = availabilities.map((availability) => {
          const availabilityStart = dayjs.tz(
            `${date.format('YYYY-MM-DD')}T${availability.start_time}`,
            'Asia/Karachi',
          );
          let availabilityEnd = dayjs.tz(
            `${date.format('YYYY-MM-DD')}T${availability.end_time}`,
            'Asia/Karachi',
          );
          if (availabilityEnd.isBefore(availabilityStart)) {
            availabilityEnd = availabilityEnd.add(1, 'day');
          }
          return { start: availabilityStart, end: availabilityEnd };
        });

        // Sort intervals
        availabilityIntervals.sort(
          (a, b) => a.start.valueOf() - b.start.valueOf(),
        );

        // Combine overlapping intervals
        const combinedIntervals = [];
        let currentInterval = availabilityIntervals[0];

        for (let i = 1; i < availabilityIntervals.length; i++) {
          const nextInterval = availabilityIntervals[i];
          if (
            currentInterval.end.isAfter(nextInterval.start) ||
            currentInterval.end.isSame(nextInterval.start)
          ) {
            // Merge intervals
            currentInterval.end = dayjs.max(
              currentInterval.end,
              nextInterval.end,
            );
          } else {
            combinedIntervals.push(currentInterval);
            currentInterval = nextInterval;
          }
        }
        combinedIntervals.push(currentInterval);

        // Check if the slot's portion is fully within any combined interval
        let isSlotFullyCovered = false;
        for (const interval of combinedIntervals) {
          if (
            slotStart.isSameOrAfter(interval.start) &&
            slotEnd.isSameOrBefore(interval.end)
          ) {
            isSlotFullyCovered = true;
            break;
          }
        }

        if (!isSlotFullyCovered) {
          console.error(
            `Slot time is outside court availability hours on ${dayName}`,
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking court availability', error.message);
      throw new BadRequestException(
        'Failed to check court availability',
        error.message,
      );
    }
  }

  async checkCourtCloseDates(dto: SlotDto): Promise<boolean> {
    try {
      const { court_id, start_time, end_time } = dto;

      const overlappingCloseDate =
        await this.prisma.court_Close_Dates.findFirst({
          where: {
            court_id,
            AND: [
              { start_time: { lt: end_time } },
              { end_time: { gt: start_time } },
            ],
          },
        });

      if (overlappingCloseDate) {
        console.error(
          `Court is closed during the requested slot time from ${overlappingCloseDate.start_time} to ${overlappingCloseDate.end_time}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to check court close dates', error.message);
      throw new BadRequestException(
        'Failed to check court close dates',
        error.message,
      );
    }
  }

  async createSlot(dto: SlotDto) {
    try {
      const { court_id, start_time, end_time } = dto;
      if (!this.timevalidator(dto)) {
        throw new BadRequestException('Invalid time slot');
      }

      const isSlotOverlapping = await this.checkOverlappingSlot(dto);
      const isCourtAvailable = await this.checkCourtAvailability(dto);
      const isCourtOpen = await this.checkCourtCloseDates(dto);

      if (!isSlotOverlapping || !isCourtAvailable || !isCourtOpen) {
        throw new BadRequestException(
          'Failed slot creation due to validation errors',
        );
      }

      const slot = await this.prisma.slot.create({
        data: { court_id, start_time: start_time, end_time: end_time },
      });

      return slot;
    } catch (error) {
      throw new BadRequestException('Failed to create slot', error.message);
    }
  }

  async updateSlot(slot_id: string, dto: SlotDto) {
    if (!this.timevalidator(dto)) {
      throw new BadRequestException('Invalid time slot');
    }
    try {
      const isSlotOverlapping = await this.checkOverlappingSlot(dto, slot_id);
      const isCourtAvailable = await this.checkCourtAvailability(dto);
      const isCourtOpen = await this.checkCourtCloseDates(dto);

      if (!isSlotOverlapping || !isCourtAvailable || !isCourtOpen) {
        throw new BadRequestException(
          'Failed slot update due to validation errors',
        );
      }

      return await this.prisma.slot.update({
        where: { id: slot_id },
        data: { ...dto },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update slot', error.message);
    }
  }

  async getSlots() {
    try {
      return await this.prisma.slot.findMany();
    } catch (error) {
      throw new BadRequestException('Failed to fetch slots', error.message);
    }
  }

  async getSlotById(id: string) {
    try {
      const slot = await this.prisma.slot.findUnique({ where: { id } });
      if (!slot) {
        throw new NotFoundException(`Slot with ID ${id} not found`);
      }
      return slot;
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch slot by id',
        error.message,
      );
    }
  }

  async deleteSlot(id: string) {
    try {
      await this.prisma.slot.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException('Failed to delete slot', error.message);
    }
  }

  async getAvailableSlotsForDay(dto: { court_id: string; date: string }) {
    const { court_id, date } = dto;

    // Get the day name based on the provided date in Pakistan Standard Time
    const dayName = dayjs
      .tz(date, 'Asia/Karachi')
      .format('dddd')
      .toLowerCase() as DAY;

    // Fetch court availability for the given day
    const availabilities = await this.prisma.court_Availability.findMany({
      where: {
        court_id,
        day: dayName,
      },
    });

    if (!availabilities.length) {
      console.error(
        `No availability found for court ${court_id} on ${dayName}`,
      );
      throw new NotFoundException(
        `No availability found for this court on the given date`,
      );
    }

    // Fetch existing slots on the given date
    const startOfDay = dayjs.tz(date, 'Asia/Karachi').startOf('day');
    const endOfDay = dayjs.tz(date, 'Asia/Karachi').endOf('day');

    const existingSlots = await this.prisma.slot.findMany({
      where: {
        court_id,
        start_time: {
          gte: startOfDay.toISOString(),
          lt: endOfDay.toISOString(),
        },
      },
    });

    // Fetch court closure dates that overlap with the given day
    const closurePeriods = await this.prisma.court_Close_Dates.findMany({
      where: {
        court_id,
        AND: [
          { start_time: { lt: endOfDay.toISOString() } },
          { end_time: { gt: startOfDay.toISOString() } },
        ],
      },
    });

    // Merge availability intervals for the day
    const availabilityIntervals = availabilities.map((availability) => {
      const availabilityStart = dayjs.tz(
        `${date}T${availability.start_time}`,
        'Asia/Karachi',
      );
      const availabilityEnd = dayjs.tz(
        `${date}T${availability.end_time}`,
        'Asia/Karachi',
      );
      return {
        start: availabilityStart,
        end: availabilityEnd,
      };
    });

    // Sort and merge overlapping availability intervals
    availabilityIntervals.sort((a, b) => a.start.valueOf() - b.start.valueOf());
    const mergedIntervals = [];
    let currentInterval = availabilityIntervals[0];

    for (let i = 1; i < availabilityIntervals.length; i++) {
      const nextInterval = availabilityIntervals[i];
      if (currentInterval.end.isSameOrAfter(nextInterval.start)) {
        // Merge intervals
        currentInterval.end = dayjs.max(currentInterval.end, nextInterval.end);
      } else {
        mergedIntervals.push(currentInterval);
        currentInterval = nextInterval;
      }
    }
    mergedIntervals.push(currentInterval);

    // Remove closure periods from availability
    closurePeriods.forEach((closure) => {
      const closureStart = dayjs.tz(closure.start_time, 'Asia/Karachi');
      const closureEnd = dayjs.tz(closure.end_time, 'Asia/Karachi');

      for (let i = 0; i < mergedIntervals.length; i++) {
        const interval = mergedIntervals[i];
        if (
          closureEnd.isBefore(interval.start) ||
          closureStart.isAfter(interval.end)
        ) {
          continue; // No overlap
        }

        // Adjust interval based on closure
        const updatedIntervals = [];
        if (closureStart.isAfter(interval.start)) {
          updatedIntervals.push({ start: interval.start, end: closureStart });
        }
        if (closureEnd.isBefore(interval.end)) {
          updatedIntervals.push({ start: closureEnd, end: interval.end });
        }

        // Replace the current interval with the updated intervals
        mergedIntervals.splice(i, 1, ...updatedIntervals);
        i += updatedIntervals.length - 1; // Adjust loop index
      }
    });

    // Remove existing slots from availability
    const availableIntervals = [];
    mergedIntervals.forEach((interval) => {
      let start = interval.start;

      existingSlots.forEach((slot) => {
        const slotStart = dayjs.tz(slot.start_time, 'Asia/Karachi');
        const slotEnd = dayjs.tz(slot.end_time, 'Asia/Karachi');

        if (slotEnd.isAfter(start) && slotStart.isBefore(interval.end)) {
          if (slotStart.isAfter(start)) {
            availableIntervals.push({ start, end: slotStart });
          }
          start = slotEnd.isAfter(start) ? slotEnd : start;
        }
      });

      if (start.isBefore(interval.end)) {
        availableIntervals.push({ start, end: interval.end });
      }
    });

    // Return available intervals formatted as strings
    return availableIntervals.map((interval) => ({
      start: interval.start.format(),
      end: interval.end.format(),
    }));
  }
}
