const { Message } = require('../models')
const { v4: uuidv4 } = require('uuid');
const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { Op } = require('sequelize');
const ChatController = {

    sendMessage: async (req) => {
        try {
            const { fromUserId, toUserId, content } = req;

            const message = await Message.create({
                id: uuidv4(),
                fromUserId: fromUserId,
                toUserId,
                content,
            });

            // Emit the message to all connected clients
            return message

        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },
    fetchMessages: async (req) => {
        try {
            const messages = await Message.findAll();
            return new Response(JSON.stringify(messages), { status: 200, headers: { 'Content-Type': 'application/json' } })
        } catch (error) {
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Internal Server Error'
            }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
    },
    fetchMessagesBetweenUsers: async (fromUserId, toUserId) => {
        try {
            const messages = await Message.findAll({
                where: {
                    [Op.or]: [
                        {
                            fromUserId: fromUserId,
                            toUserId: toUserId,
                        },
                        {
                            fromUserId: toUserId,
                            toUserId: fromUserId,
                        },
                    ],
                },
                order: [['createdAt', 'ASC']],
            });
            return messages;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    aiGenerate: async (user, content, history) => {
        const model = new ChatOpenAI({ temperature: 0, modelName: "gpt-3.5-turbo" });
        const messages = history.map(message => {
            if (message.fromUserId === user.id) {
                return new HumanMessage(message.content)
            } else {
                return new SystemMessage(message.content)
            }
        })
        const appData = {
            "FormalSpecificationDocument": {
                "Introduction": {
                    "description": "This document outlines the formal specifications for a mobile application that connects users in Morocco with contractors for home services, such as plumbing, maid services, and potentially other categories. The application will operate in accordance with Moroccan industry standards and regulations."
                },
                "SystemOverview": {
                    "userGroups": [
                        {
                            "type": "Users",
                            "description": "Individuals residing in Morocco who require home services."
                        },
                        {
                            "type": "Contractors",
                            "description": "Pre-vetted individuals or companies offering home services in Morocco."
                        }
                    ],
                    "purpose": "The application will facilitate communication and service booking between users and contractors."
                },
                "FunctionalRequirements": {
                    "UserFunctionalities": {
                        "UserRegistrationAndLogin": {
                            "description": "Users can register with the application using their phone number or email address. Login functionality should be secure and user-friendly."
                        },
                        "BrowseServices": {
                            "description": "Users can browse through a list of available home service categories (e.g., plumbing, maid service, etc.)."
                        },
                        "RequestService": {
                            "description": "Users will specify the desired service, location, date, and time.",
                            "matchingCriteria": [
                                "User location and service requested",
                                "Contractor availability",
                                "Contractor ratings and reviews (optional)",
                                "Any other relevant matching criteria defined during development"
                            ]
                        },
                        "ReviewAndBook": {
                            "description": "Users will receive a notification with details of the automatically assigned contractor, including profile information, service quote (optional), and user reviews (optional). Users can then confirm the booking or request a re-assignment with a valid reason.",
                            "additionalConsiderations": [
                                "Transparency: The application should clearly explain the automatic assignment process.",
                                "MatchingAlgorithm: The algorithm should be fair and transparent.",
                                "Communication: The application should facilitate communication between users and contractors before booking.",
                                "UserFeedback: Implement a mechanism for users to provide feedback on their experience.",
                                "Payment: Users can securely pay for services through the application.",
                                "InAppCommunication: Users can communicate with contractors directly through the application's messaging feature.",
                                "RatingAndReview: Users can rate and review completed services."
                            ]
                        }
                    },
                    "ContractorFunctionalities": {
                        "ContractorRegistrationAndLogin": {
                            "description": "Contractors can register with the application by providing relevant details, qualifications (if applicable), and service offerings."
                        },
                        "ManageProfile": {
                            "description": "Contractors can update their profile information, service listings, availability, and pricing."
                        },
                        "ReceiveServiceRequests": {
                            "description": "Contractors can receive service requests from users within their specified service area."
                        },
                        "SubmitQuotes": {
                            "description": "Contractors can review service requests and submit quotes to users."
                        },
                        "ManageBookings": {
                            "description": "Contractors can view and manage confirmed bookings, communicate with users, and update the application on job completion."
                        },
                        "PaymentManagement": {
                            "description": "Contractors can track payments received through the application."
                        }
                    }
                },
                "NonFunctionalRequirements": {
                    "Security": {
                        "description": "The application must adhere to industry-standard security practices to protect user and contractor data, including secure data storage, encryption, and user authentication."
                    },
                    "Performance": {
                        "description": "The application should be responsive and function smoothly on a variety of mobile devices with varying internet connection speeds."
                    },
                    "Localization": {
                        "description": "The application interface and content should be available in Arabic and French."
                    },
                    "Compliance": {
                        "description": "The application must comply with all relevant Moroccan regulations regarding data privacy, consumer protection, and e-commerce."
                    }
                },
                "TechnicalRequirements": {
                    "description": "The specific technical requirements will depend on the chosen development platform and technologies. The application should be built using robust and scalable technologies to accommodate future growth."
                },
                "UserInterfaceRequirements": {
                    "description": "The UI should be user-friendly, intuitive, and culturally appropriate for the Moroccan target audience.",
                    "considerations": [
                        "Language: Support for Arabic and French languages.",
                        "CulturalSensitivity: Design elements that resonate with the Moroccan user base.",
                        "ClarityAndEaseOfUse: Menus, buttons, and functionalities should be clear and easy to understand."
                    ]
                },
                "Testing": {
                    "description": "The application will undergo rigorous testing to ensure functionality, performance, and security before deployment."
                },
                "Deployment": {
                    "description": "The application will be deployed on the Apple App Store and Google Play Store for users in Morocco."
                },
                "MaintenanceAndSupport": {
                    "description": "An ongoing maintenance and support plan will ensure the application's smooth operation, timely bug fixes, and potential future feature additions."
                },
                "RegulatoryConsiderations": {
                    "DataProtectionAct": {
                        "description": "The application must comply with Moroccan data privacy regulations regarding user data collection, storage, and usage."
                    },
                    "EcommerceRegulations": {
                        "description": "The application should adhere to any relevant Moroccan regulations governing online transactions and consumer protection."
                    }
                },
                "FutureEnhancements": {
                    "description": "The application can be enhanced in the future to include additional features such as:",
                    "enhancements": [
                        "Integration with electronic payment systems widely used in Morocco.",
                        "Background verification for contractors.",
                        "In-app scheduling and job management tools for contractors.",
                        "Additional home service categories based on user demand."
                    ]
                }
            }
        }
        const policy = {
            "TermsAndPolicies": {
                "Introduction": {
                    "description": "These Terms and Policies govern your use of the mobile application ('App') that connects users in Morocco with contractors for home services ('Services'). By using the App, you agree to be bound by these Terms and Policies."
                },
                "UserEligibility": {
                    "description": "The App is intended for users who are 18 years of age or older and reside in Morocco."
                },
                "UserRegistrationAndAccount": {
                    "requirements": [
                        "You can register with the App using your phone number or email address.",
                        "You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.",
                        "You agree to keep your account information accurate and updated."
                    ]
                },
                "ContractorRegistrationAndAccount": {
                    "requirements": [
                        "Contractors can register by providing relevant details, qualifications (if applicable), and service offerings.",
                        "Contractors are responsible for the accuracy of the information provided in their profiles and for the quality of services offered.",
                        "Background verification for contractors may be implemented in the future."
                    ]
                },
                "ServicesAndBooking": {
                    "requirements": [
                        "The App facilitates communication and booking of Services between users and contractors.",
                        "Users can browse available service categories and request specific services.",
                        "The App will automatically match users with qualified contractors based on pre-defined criteria.",
                        "Users can review contractor profiles, quotes (optional), and ratings (optional) before confirming booking.",
                        "Users can request re-assignment to a different contractor with a valid reason, but re-assignment may be limited."
                    ]
                },
                "UserPayment": {
                    "requirements": [
                        "Users can securely pay for Services through the App using integrated payment gateways that comply with Moroccan regulations.",
                        "The App may not be responsible for any payment processing issues."
                    ]
                },
                "Communication": {
                    "requirements": [
                        "The App facilitates communication between users and contractors for booking-related inquiries.",
                        "Users and contractors are responsible for maintaining respectful communication throughout the service process."
                    ]
                },
                "UserFeedbackAndRatings": {
                    "requirements": [
                        "Users can provide feedback on their experience with assigned contractors and the overall auto-assignment process.",
                        "Users can rate and review completed services to provide feedback to contractors and other users."
                    ]
                },
                "DataPrivacy": {
                    "requirements": [
                        "The App complies with the Data Protection Act of Morocco (Law 09-08) regarding user data collection, storage, and usage.",
                        "We will only collect and use your personal information for the purposes of providing and improving the App's services.",
                        "You have the right to access, modify, or delete your personal information upon request.",
                        "Personal data transfers outside Morocco require prior authorization from the CNDP (Commission Nationale de Protection des Données Personnelles).",
                        "The App implements stringent cybersecurity measures in compliance with Law No. 05-20 on cybersecurity. This includes regular risk assessments, breach notification protocols, and the use of advanced tools for threat detection and response to safeguard user data."
                    ]
                },
                "Disclaimer": {
                    "requirements": [
                        "The App acts as a platform to connect users and contractors.",
                        "We do not guarantee the quality or outcome of any Services provided by contractors.",
                        "Users are responsible for verifying contractor qualifications and references before booking."
                    ]
                },
                "LimitationOfLiability": {
                    "requirements": [
                        "We are not liable for any damages arising from the use of the App or the Services provided by contractors.",
                        "Users are responsible for any damages caused to their property or themselves during service execution."
                    ]
                },
                "Termination": {
                    "requirements": [
                        "We reserve the right to terminate your account or access to the App for any violation of these Terms and Policies."
                    ]
                },
                "GoverningLaw": {
                    "description": "These Terms and Policies are governed by and construed in accordance with the laws of Morocco."
                },
                "UpdatesToTermsAndPolicies": {
                    "description": "We may update these Terms and Policies at any time by posting the revised version on the App."
                },
                "ContactUs": {
                    "description": "If you have any questions regarding these Terms and Policies, please contact us through the App's support channel."
                }
            }
        }
        const userFlow = {
            "UserFlow": {
                "steps": [
                    {
                        "step": "RegisterWithGoogle",
                        "description": "User registers with the application using their Google account."
                    },
                    {
                        "step": "LoginWithGoogle",
                        "description": "User logs in to the application using their Google account."
                    },
                    {
                        "step": "ChooseCategoryOfServices",
                        "description": "User chooses the category of services, such as maid, plumber, or electrician."
                    },
                    {
                        "step": "ChooseSpecificService",
                        "description": "User selects the specific service they want to link to, for example, deep cleaning."
                    },
                    {
                        "step": "ChooseOptionalServices",
                        "description": "User selects any optional services to include with the main service."
                    },
                    {
                        "step": "ChooseDateAndHour",
                        "description": "User selects a date and time to schedule the service."
                    },
                    {
                        "step": "AutoAssignContractor",
                        "description": "The application automatically assigns a qualified contractor to the user's project based on pre-defined criteria."
                    },
                    {
                        "step": "ContactContractor",
                        "description": "User can contact the assigned contractor via the phone number provided."
                    }
                ]
            }
        }

        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `You are a helpful customer support who answers users this is his {information}, you answer about anything related to {appData} or app policy {policy} or the user flow of the app {userFlow} only
                you return just helpful answers on the app if you cant find the answer about the app you ask the user to contact this number +212762868577`,
            ],
            ["placeholder", "{chat_history}"],
            ["human", "{input}"],
        ]);

        const chain = prompt.pipe(model);
        const response = await chain.invoke({
            chat_history: messages,
            input: content,
            information: user,
            appData,
            policy,
            userFlow
        });
        return response.content;
    }
}

module.exports = ChatController