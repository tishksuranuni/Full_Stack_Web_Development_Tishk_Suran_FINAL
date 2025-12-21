const Joi = require('joi');

const passwordSchema = Joi.string()
    .min(8)
    .max(32)
    .pattern(/[A-Z]/, 'uppercase')
    .pattern(/[a-z]/, 'lowercase')
    .pattern(/[0-9]/, 'number')
    .pattern(/[!@#$%^&*(),.?":{}|<>]/, 'special character')
    .required();

const userCreateSchema = Joi.object({
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    password: passwordSchema
}).options({ presence: 'required' });

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
}).options({ presence: 'required' });

const itemCreateSchema = Joi.object({
    name: Joi.string().min(1).required(),
    description: Joi.string().min(1).required(),
    starting_bid: Joi.number().integer().min(1).required(),
    end_date: Joi.alternatives().try(
        Joi.number().integer().greater(Date.now()),
        Joi.string().pattern(/^\d+$/).custom((value, helpers) => {
            const num = parseInt(value, 10);
            if (num <= Date.now()) {
                return helpers.error('any.invalid');
            }
            return num;
        })
    ).required()
}).options({ presence: 'required' });

const bidCreateSchema = Joi.object({
    amount: Joi.number().integer().min(1).required()
}).options({ presence: 'required' });

const questionCreateSchema = Joi.object({
    question_text: Joi.string().min(1).required()
}).options({ presence: 'required' });

const answerCreateSchema = Joi.object({
    answer_text: Joi.string().min(1).required()
}).options({ presence: 'required' });

const validate = (schema, data) => {
    const { error } = schema.validate(data, { abortEarly: true });
    if (error) {
        return { valid: false, error: error.details[0].message };
    }
    return { valid: true };
};

module.exports = {
    userCreateSchema,
    loginSchema,
    itemCreateSchema,
    bidCreateSchema,
    questionCreateSchema,
    answerCreateSchema,
    validate
};
