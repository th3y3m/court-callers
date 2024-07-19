export const reviewTextValidation = (reviewText) => {
    if(reviewText.length < 8){
        return {isValid: false, message: 'You need to full fill this box. At least 8 characters!'}
    }
    return{isValid: true, message: ''}
}

export const valueValidation = (value) => {
    if(value < 1){
        return {isValid: false, message: 'Choose number of stars !'}
    }
    return{isValid: true, message: ''}
}