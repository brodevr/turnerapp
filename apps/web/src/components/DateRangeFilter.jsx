
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DateRangeFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  const { t } = useTranslation();
  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <Label htmlFor="start-date" className="mb-2 block">{t('admin.appointments.startDate', { defaultValue: 'Start Date' })}</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="end-date" className="mb-2 block">{t('admin.appointments.endDate', { defaultValue: 'End Date' })}</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
