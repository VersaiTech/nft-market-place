export const validateField = (fieldName, value) => {
  let fieldError = '';

  const numberRegex = /^\d+(\.\d+)?$/;
  const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/[\w.-]*)*\/?$/i;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const positiveNumberRegex = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;

  switch (fieldName) {
    case 'name':
    case 'category':
    case 'description':
    case 'userName':
    case 'password':
    case 'walletAddress':
    case 'durationDate':
    case 'nftData':
      if (value.trim() === '') {
        fieldError = `${capitalizeAndAddSpace(fieldName)} is required`;
      }
      break;
    case 'price':
    case 'endingPrice':
    case 'bidAmount':
      if (value.trim() === '') {
        fieldError = `${capitalizeAndAddSpace(fieldName)} is required`;
      } else if (!positiveNumberRegex.test(value)) {
        fieldError = `${capitalizeAndAddSpace(fieldName)} value is required`;
      }
      break;
    case 'url':
      if (value.trim() === '') {
        fieldError = 'URL is required';
      } else if (!urlRegex.test(value)) {
        fieldError = 'URL is not valid';
      }
      break;
    case 'email':
      if (value.trim() === '') {
        fieldError = 'Email is required';
      } else if (!emailRegex.test(value)) {
        fieldError = 'Email is not valid';
      }
      break;
    case 'royality':
      if (value.trim() === '') {
        fieldError = 'Royality is required';
      } else if (!numberRegex.test(value)) {
        fieldError = 'Royality should be a number';
      }
      break;

    case 'file':
    case 'logo':
    case 'banner':
      if (!value) {
        fieldError = `${capitalizeAndAddSpace(fieldName)} is required`;
      }
      break;
    default:
      break;
  }
  return fieldError;
};

export const validateFields = (fieldsToValidate, state, setState) => {
  const formErrors = {};

  fieldsToValidate.forEach((fieldName) => {
    const fieldError = validateField(fieldName, state[fieldName]);
    if (fieldError) {
      formErrors[fieldName] = fieldError;
    }
  });
  setState({ error: formErrors });
  return Object.keys(formErrors).length === 0;
};

const capitalizeAndAddSpace = (str) => {
  const modifiedString = str.replace(/([a-z])([A-Z])/g, '$1 $2');
  return modifiedString.charAt(0).toUpperCase() + modifiedString.slice(1);
};
