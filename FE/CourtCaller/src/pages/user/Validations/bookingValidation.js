export const flexValidation = (slots) => {
    const slotNumber = Number(slots);

    if (isNaN(slotNumber)) {
        return { isValid: false, message: 'You must input a number' };
    }

    if (slotNumber > 10) {
        return { isValid: false, message: 'You can only book a maximum of 10 slots each time' };
    }

    return { isValid: true, message: '' };
};

export const fixMonthValidation = (months) => {
    if (months > 3) {
        return { isValid: false, message: 'You can only book a maximum of 3 months each time' };
    }

    return { isValid: true, message: '' };
};

export const fixDayOfWeekValidation = (day) => {
    if (day.length == 0) {
        return {isValid: false, message: 'You need to choose day of week'};
    }
    return  {isValid: true, message: '' };
}

export const fixStartTimeValidation = (startTime) => {
    const timeFormat = /^\d{2}:00:00$/;

    if (!timeFormat.test(startTime)) {
        return { isValid: false, message: 'Following the format hh:00:00' };
    }

    return { isValid: true, message: '' };
};

export const fixEndTimeValidation = (startTime, endTime) => {
    const timeFormat = /^\d{2}:00:00$/;

    if (!timeFormat.test(endTime)) {
        return { isValid: false, message: 'Following the format hh:00:00' };
    }

    const startHour = parseInt(startTime.split(':')[0], 10);
    const endHour = parseInt(endTime.split(':')[0], 10);

    if (endHour - startHour !== 1) {
        return { isValid: false, message: 'End Time is 1 hour later than Start Time' };
    }

    return { isValid: true, message: '' };
};
