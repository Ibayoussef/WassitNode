const { User, Wallet, UserAvailability, Address, CreditCard } = require('../models/index.cjs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const AuthController = {
    googleLogin: async (req) => {
        try {
            // Extract the Google ID token from the request body
            const { idToken } = await req.body;
            if (!idToken) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'ID token not provided',
                }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }

            // Verify the Google ID token
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const googleUser = ticket.getPayload();

            // Find or create the user in the database
            const [user, created] = await User.findOrCreate({
                where: { email: googleUser.email },
                defaults: {
                    name: googleUser.name,
                    password: await bcrypt.hash('Password123$', 10), // Set a default password
                    // Add other fields like avatar, etc., if needed
                },
            });

            // Generate JWT token
            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { algorithm: process.env.JWT_ALGO, expiresIn: '1h' });

            // Load relations if needed (similar to the login method)
            const availabilities = await user.getAvailabilities();
            const addresses = await user.getAddresses();
            const creditCards = await user.getCreditCards();

            // Return the user and token
            return new Response(JSON.stringify({
                status: 'success',
                user: { ...user.toJSON(), availabilities, addresses, creditCards },
                authorization: {
                    token: token,
                    type: 'bearer',
                },
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });

        } catch (error) {
            console.error('Error during Google login:', error);
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Failed to authenticate with Google. ' + error.message,
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },
    register: async (req) => {
        try {
            const body = await req.body;
            const {
                name, email, phone, role, address, description,
                domain, coords, password
            } = body;

            // Validate input
            if (!name || !email || !phone || !role || !password) {
                return new Response(JSON.stringify({
                    status: 'error',
                    errors: {
                        name: 'Name is required',
                        email: 'Email is required',
                        phone: 'Phone is required',
                        role: 'Role is required',
                        password: 'Password is required'
                    }
                }), { status: 422, headers: { 'Content-Type': 'application/json' } });
            }

            // Additional validations for password and email
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
            if (!passwordRegex.test(password)) {
                return new Response(JSON.stringify({
                    status: 'error',
                    errors: { password: 'The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' }
                }), { status: 422, headers: { 'Content-Type': 'application/json' } });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return new Response(JSON.stringify({
                    status: 'error',
                    errors: { email: 'Email already exists' }
                }), { status: 422, headers: { 'Content-Type': 'application/json' } });
            }

            // Create user in the database
            const user = await User.create({
                id: uuidv4(),
                name, email, phone, role, address, domain, coords, description, password
            });

            // Create wallet for the user
            await Wallet.create({ balance: 0, user_id: user.id });

            // Generate JWT token
            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { algorithm: process.env.JWT_ALGO, expiresIn: '1h' });

            return new Response(JSON.stringify({
                status: 'success',
                message: 'User created successfully',
                user: user,
                authorisation: {
                    token: token,
                    type: 'bearer'
                }
            }), { status: 201, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error during registration:', error);
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Failed to create user',
                error: error.message
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    login: async (req) => {
        try {

            const body = await req.body;
            console.log(body)
            const { email, password } = body;

            // Validate input
            if (!email || !password) {
                return new Response(JSON.stringify({
                    status: 'error',
                    errors: { email: 'Email is required', password: 'Password is required' }
                }), { status: 422, headers: { 'Content-Type': 'application/json' } });
            }

            // Check user credentials
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Unauthorized'
                }), { status: 401, headers: { 'Content-Type': 'application/json' } });
            }

            // Compare passwords
            const comparedPassword = await bcrypt.compare(password, user.password);
            console.log('Password Comparison:', comparedPassword);

            if (!comparedPassword) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Unauthorized'
                }), { status: 401, headers: { 'Content-Type': 'application/json' } });
            }

            // Generate JWT token
            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { algorithm: process.env.JWT_ALGO, expiresIn: '1h' });

            // Load user related data
            const availabilities = await user.getAvailabilities();
            const addresses = await user.getAddresses();
            const creditCards = await user.getCreditCards();

            return new Response(JSON.stringify({
                status: 'success',
                user: { ...user.toJSON(), availabilities, addresses, creditCards },
                authorisation: {
                    token: token,
                    type: 'bearer'
                }
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error during login:', error);
            return new Response("Internal Server Error", { status: 500 });
        }
    },

    allUsers: async (req) => {
        try {
            const users = await User.findAll();
            return new Response(JSON.stringify(users), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error fetching all users:', error);
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Failed to fetch users',
                error: error.message
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    authUser: async (req) => {
        try {
            // Get the JWT token from the request headers
            const token = req.header('authorization')?.split(' ')[1];
            if (!token) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Token not provided',
                }), { status: 401, headers: { 'Content-Type': 'application/json' } });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [process.env.JWT_ALGO] });
            const userId = decoded.id;

            // Fetch the user from the database
            const user = await User.findByPk(userId, {
                include: [
                    { model: UserAvailability, as: 'availabilities' },
                    { model: Address, as: 'addresses' },
                    { model: CreditCard, as: 'creditCards' },
                ],
            });

            if (!user) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'User not found',
                }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            return new Response(JSON.stringify(user), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error fetching authenticated user:', error);
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Failed to fetch authenticated user',
                error: error.message,
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },


    update: async (req, res) => {



        try {
            // Extract the JWT token from the request headers
            const token = req.header('authorization')?.split(' ')[1];
            if (!token) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Token not provided',
                }), { status: 401, headers: { 'Content-Type': 'application/json' } });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [process.env.JWT_ALGO] });
            const userId = decoded.id;

            // Fetch the authenticated user
            const user = await User.findByPk(userId);
            if (!user) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'User not found',
                }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            // Parse the JSON body manually if there's no file
            let body = {};
            body = await req.body;


            // Validate input
            const errors = [];
            if (body.name && typeof body.name !== 'string') errors.push('Invalid name');
            if (body.email && (typeof body.email !== 'string' || !body.email.includes('@'))) errors.push('Invalid email');
            if (body.phone && typeof body.phone !== 'string') errors.push('Invalid phone');
            if (body.password && typeof body.password !== 'string') errors.push('Invalid password');
            if (errors.length) {
                return res(new Response(JSON.stringify({
                    status: 'error',
                    errors,
                }), { status: 422, headers: { 'Content-Type': 'application/json' } }));
            }

            // Handle profile picture upload
            if (req.file) {
                user.profile_picture = `/profile_pictures/${req.file.filename}`;
            }

            // Update other fields
            user.name = body.name || user.name;
            user.email = body.email || user.email;
            user.phone = body.phone || user.phone;
            user.address = body.address || user.address;
            user.description = body.description || user.description;
            user.domain = body.domain || user.domain;
            user.coords = body.coords || user.coords;

            // Update password if provided
            if (body.password) {
                user.password = await bcrypt.hash(body.password, 10);
            }

            await user.save();

            return new Response(JSON.stringify({
                message: 'User updated successfully',
                user,
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error updating user:', error);
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Failed to update user',
                error: error.message,
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

    },
    updateAvailability: async (req) => {
        try {
            // Extract the JWT token from the request headers
            const token = req.header('authorization')?.split(' ')[1];
            if (!token) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Token not provided',
                }), { status: 401, headers: { 'Content-Type': 'application/json' } });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [process.env.JWT_ALGO] });
            const userId = decoded.id;

            // Fetch the authenticated user
            const user = await User.findByPk(userId);
            if (!user) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'User not found',
                }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            // Parse and validate the request body
            const body = await req.body;
            const { date, is_available } = body;

            const errors = [];
            if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('Invalid date format. Expected format: Y-m-d');
            if (is_available === undefined || typeof is_available !== 'boolean') errors.push('is_available must be a boolean');

            if (errors.length) {
                return new Response(JSON.stringify({
                    status: 'error',
                    errors,
                }), { status: 422, headers: { 'Content-Type': 'application/json' } });
            }

            // Update or create the availability record
            await UserAvailability.updateOrCreate(
                { user_id: user.id, date },
                { is_available: is_available }
            );

            return new Response(JSON.stringify({
                message: 'Availability updated successfully',
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error updating availability:', error);
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Failed to update availability',
                error: error.message,
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    storeAddr: async (req) => {
        try {
            // Extract the JWT token from the request headers
            const token = req.header('authorization')?.split(' ')[1];
            if (!token) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Token not provided',
                }), { status: 401, headers: { 'Content-Type': 'application/json' } });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [process.env.JWT_ALGO] });
            const userId = decoded.id;

            // Fetch the authenticated user
            const user = await User.findByPk(userId);
            if (!user) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'User not found',
                }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            // Parse and validate the request body
            const body = await req.body;
            const { type, street_name, residence_name, house_number, coords } = body;

            const errors = [];
            const validTypes = ['villa', 'flat', 'office'];
            if (!type || !validTypes.includes(type)) errors.push('Invalid type. Must be one of villa, flat, office.');
            if (!street_name || typeof street_name !== 'string' || street_name.length > 255) errors.push('Invalid street name.');
            if (!residence_name || typeof residence_name !== 'string' || residence_name.length > 255) errors.push('Invalid residence name.');
            if (!house_number || typeof house_number !== 'string' || house_number.length > 255) errors.push('Invalid house number.');
            if (coords && typeof coords !== 'string') errors.push('Invalid coordinates.');

            if (errors.length) {
                return new Response(JSON.stringify({
                    status: 'error',
                    errors,
                }), { status: 422, headers: { 'Content-Type': 'application/json' } });
            }

            // Create the address record
            const address = await Address.create({
                user_id: user.id,
                type,
                street_name: street_name,
                residence_name: residence_name,
                house_number: house_number,
                coords,
            });

            return new Response(JSON.stringify(address), { status: 201, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error storing address:', error);
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Failed to store address',
                error: error.message,
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },
    destroyAddr: async (req) => {
        try {
            // Extract the JWT token from the request headers
            const token = req.header('authorization')?.split(' ')[1];
            if (!token) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Token not provided',
                }), { status: 401, headers: { 'Content-Type': 'application/json' } });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [process.env.JWT_ALGO] });
            const userId = decoded.id;

            // Fetch the authenticated user
            const user = await User.findByPk(userId);
            if (!user) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'User not found',
                }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            // Extract and validate the address ID
            const addressId = req.params.addressId;
            if (!addressId) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Address ID is required',
                }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }

            // Fetch the address
            const address = await Address.findByPk(addressId);
            if (!address) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Address not found',
                }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            // Optional: Check if the authenticated user is allowed to delete this address
            if (address.userId !== user.id) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Unauthorized to delete this address',
                }), { status: 403, headers: { 'Content-Type': 'application/json' } });
            }

            // Delete the address
            await address.destroy();

            return new Response(null, { status: 204 }); // 204 No Content
        } catch (error) {
            console.error('Error deleting address:', error);
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Failed to delete address',
                error: error.message,
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    storeCard: async (req) => {
        try {
            // Extract the JWT token from the request headers
            const token = req.header('authorization')?.split(' ')[1];
            if (!token) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Token not provided',
                }), { status: 401, headers: { 'Content-Type': 'application/json' } });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [process.env.JWT_ALGO] });
            const userId = decoded.id;

            // Fetch the authenticated user
            const user = await User.findByPk(userId);
            if (!user) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'User not found',
                }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            // Parse and validate the request body
            const body = await req.body;
            const { card_provider, card_number, expiry_month, expiry_year } = body;

            const errors = [];
            if (!card_provider || typeof card_provider !== 'string') errors.push('Invalid card provider');
            if (!card_number || typeof card_number !== 'string') errors.push('Invalid card number');
            if (!expiry_month || typeof expiry_month !== 'string' || expiry_month.length !== 2) errors.push('Invalid expiry month');
            if (!expiry_year || typeof expiry_year !== 'string' || expiry_year.length !== 4) errors.push('Invalid expiry year');

            if (errors.length) {
                return new Response(JSON.stringify({
                    status: 'error',
                    errors,
                }), { status: 422, headers: { 'Content-Type': 'application/json' } });
            }

            // Create the credit card record
            const creditCard = await CreditCard.create({
                user_id: user.id,
                card_provider: card_provider,
                card_number: card_number,
                expiry_month: expiry_month,
                expiry_year: expiry_year,
            });

            return new Response(JSON.stringify(creditCard), { status: 201, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error storing credit card:', error);
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Failed to store credit card',
                error: error.message,
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    updateCard: async (req) => {
        try {
            // Extract the JWT token from the request headers
            const token = req.header('authorization')?.split(' ')[1];
            if (!token) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Token not provided',
                }), { status: 401, headers: { 'Content-Type': 'application/json' } });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [process.env.JWT_ALGO] });
            const userId = decoded.id;

            // Fetch the authenticated user
            const user = await User.findByPk(userId);
            if (!user) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'User not found',
                }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            // Extract and validate the card ID and request body
            const cardId = req.params.cardId;
            if (!cardId) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Card ID is required',
                }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }

            const body = await req.body;
            const { card_provider, card_number, expiry_month, expiry_year } = body;

            const errors = [];
            if (card_provider && typeof card_provider !== 'string') errors.push('Invalid card provider');
            if (card_number && typeof card_number !== 'string') errors.push('Invalid card number');
            if (expiry_month && (typeof expiry_month !== 'string' || expiry_month.length !== 2)) errors.push('Invalid expiry month');
            if (expiry_year && (typeof expiry_year !== 'string' || expiry_year.length !== 4)) errors.push('Invalid expiry year');

            if (errors.length) {
                return new Response(JSON.stringify({
                    status: 'error',
                    errors,
                }), { status: 422, headers: { 'Content-Type': 'application/json' } });
            }

            // Fetch the credit card
            const creditCard = await CreditCard.findByPk(cardId);
            if (!creditCard) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Credit card not found',
                }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            // Update the credit card
            await creditCard.update({
                card_provider: card_provider,
                card_number: card_number,
                expiry_month: expiry_month,
                expiry_year: expiry_year,
            });

            return new Response(JSON.stringify(creditCard), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error updating credit card:', error);
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Failed to update credit card',
                error: error.message,
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    destroyCard: async (req) => {
        try {
            // Extract the JWT token from the request headers
            const token = req.header('authorization')?.split(' ')[1];
            if (!token) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Token not provided',
                }), { status: 401, headers: { 'Content-Type': 'application/json' } });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [process.env.JWT_ALGO] });
            const userId = decoded.id;

            // Fetch the authenticated user
            const user = await User.findByPk(userId);
            if (!user) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'User not found',
                }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            // Extract and validate the card ID
            const cardId = req.params.cardId;
            if (!cardId) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Card ID is required',
                }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }

            // Fetch the credit card
            const creditCard = await CreditCard.findByPk(cardId);
            if (!creditCard) {
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Credit card not found',
                }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }

            // Delete the credit card
            await creditCard.destroy();

            return new Response(null, { status: 204 }); // 204 No Content
        } catch (error) {
            console.error('Error deleting credit card:', error);
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Failed to delete credit card',
                error: error.message,
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    },

    sendVerificationSMS: async (req) => {
        // Implement logic to send verification SMS here
        return new Response("Send verification SMS", { status: 200 });
    },

    verify: async (req) => {
        // Implement logic to verify SMS here
        return new Response("Verify", { status: 200 });
    },
};

module.exports = AuthController