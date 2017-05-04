// util functions
export var Utils = {
	/**
	 * validates a value based on a hash of validations
	 * second parameter has format e.g., 
	 * {required: true, minLength: 5, email: true}
	 * (for required field, with min length of 5, and valid email)
	 */
	'validate': function (value, validations) {
		var errors = {
			isValid: true,
			style: ''
		};

		if (value !== undefined) { //check validations
			//handle required
			if (validations.required && value === '') {
				errors.required = true;
				errors.isValid = false;
			}

			//handle minLength
			if (validations.minLength && value.length < validations.minLength) {
				errors.minLength = validations.minLength;
				errors.isValid = false;
			}

			//handle email type ??
			if (validations.email) {
				//pattern comparison from w3c
				//https://www.w3.org/TR/html-markup/input.email.html#input.email.attrs.value.single
				var valid = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)
				if (!valid) {
					errors.email = true;
					errors.isValid = false;
				}
			}
		}

		//handle the password confirmation matching
		if (validations.toBeMatched && value !== validations.toBeMatched) {
			errors.matches = true;
			errors.isValid = false;
		}

		//display details
		if (!errors.isValid) { //if found errors
			errors.style = 'has-error';
		} else if (value !== undefined) { //valid and has input
			//errors.style = 'has-success' //show success coloring
		} else { //valid and no input
			errors.isValid = false; //make false anyway
		}
		return errors; //return data object
	}
}