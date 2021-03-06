'use strict';

const express = require('express');
const bodyParser = require('body-parser');


const restService = express();
restService.use(bodyParser.json());

/**
 * Methods ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 */
var METHODS = [
    {
        name: 'waterbath', explanation: 'For a waterbath place a heatproof bowl over a span of simmering water. Make' +
    ' sure the base does not touch the water. Break the chocolate into the bowl and allow it to melt!'
    }
];

/**
 * Example Recipe ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 */
var oil = {name: 'oil', amount: '5 tablespoons'};
var chocolate = {name: 'dark chocolate (vegan)', amount: '200 gram'};
var flour = {name: 'flour', amount: '170 gram'};
var cocoaPowder = {name: 'cocoa powder', amount: '3 teaspoons'};
var sugar = {name: 'sugar', amount: '180 gram'};
var seaSalt = {name: 'sea salt', amount: 'a pinch'};
var vanillaPod = {name: 'vanilla pod', amount: '1'};
var veganMilk = {name: 'vegan milk', amount: '230 milliliter'};
var walnuts = {name: 'walnuts', amount: '200 gram'};
var ingredients = [oil, chocolate, flour, cocoaPowder, sugar, seaSalt, vanillaPod, veganMilk, walnuts];

var step1 = 'So first preheat the oven to 180 degrees and cover an oven tray with baking paper.';
var step2 = 'The next step would be to heat up 150 gram of chocolate until its completely melted. You can do this' +
    ' with an microwave or a waterbath.';
var step3 = 'Sieve the 170 gram flour and 5 teaspoons cocoa powder into a large bowl.';
var step4 = 'Add the 180 gram of sugar and the pinch of sea salt.';
var step5 = 'Halve the vanilla pod lengthways, scrape out the seeds and add them to the bowl.';
var step6 = 'Stir in the 5 tablespoons oil, the 230 milliliters vegan milk and the melted chocolate until everything' +
    ' is combined nicely.';
var step7 = 'Roughly chop the remaining 50 gram of chocolate and 150 gram of walnuts, and stir it in!';
var step8 = 'Wow, we nearly finished! Pour the mixture into the prepared oven tray and spread it out evenly.' +
    ' Sprinkle over the remaining 50 gram walnuts and place this beauty in the hot oven! I´ll remind you in 20' +
    ' minutes.';
var steps = [step1, step2, step3, step4, step5, step6, step7, step8];
/* Recipe */
var chocolateBrownies = {
    name: 'chocolate brownies',
    ingredients: ingredients,
    steps: steps,
    timerTime: 20
};
/* States */
var currentStep = 0;
var addGoodByeFollowUp = false;
var addExpectUserResponseFalse = false;

function getCurrentStep() {
    return chocolateBrownies.steps[currentStep];
}

function getNextStep() {
    var nextStep = currentStep + 1;
    if (nextStep < chocolateBrownies.steps.length) {
        currentStep = nextStep;
        return chocolateBrownies.steps[nextStep];
    }
    addGoodByeFollowUp = true;
}

function getLastStep() {
    var lastStep = currentStep - 1;
    if (lastStep >= 0) {
        currentStep = lastStep;
        return chocolateBrownies.steps[lastStep];
    }
    return 'You´re already at the first step. Ask for the current step.'
}

function getIngredientsAsString() {
    var ingredientString = '';
    chocolateBrownies.ingredients.forEach(function (ingredient) {
        ingredientString += ingredient.amount + ' ' + ingredient.name + ', ';
    });
    return ingredientString;
}

function resetData() {
    currentStep = 0;
    addGoodByeFollowUp = false;
}

function getMethodExplanation(methodName) {
    var method = METHODS.find(function (method) {
        return method.name = methodName;
    });
    return method.explanation;
}

function getIngredientAmount(ingredientName) {
    var ingredient = chocolateBrownies.ingredients.find(function (ingredient) {
        return ingredient.name.toLocaleLowerCase() === ingredientName.toLocaleLowerCase() || ingredient.name.toLocaleLowerCase().includes(ingredientName.toLocaleLowerCase())
    });
    return ingredient.amount;
}
/**
 * Handling incoming messages at /hook +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 */
restService.post('/hook', function (request, result) {
    try {
        var speech = 'empty speech';

        if (request.body) {
            var requestBody = request.body;

            if (requestBody.result) {
                speech = '';
                //If there was already text given, add it again
                if (requestBody.result.fulfillment) {
                    speech += requestBody.result.fulfillment.speech;
                    speech += ' ';
                }
                //Action distinction
                if (requestBody.result.action) {
                    switch (requestBody.result.action) {
                        case 'chooseRecipe':
                            speech += getIngredientsAsString();
                            speech += '. Should I repeat it?';
                            break;
                        case 'repeatIngredients':
                            speech += getIngredientsAsString() + '. Got it? Ask me to tell you the' +
                                ' ingredients again if not, or ask for the current step.';
                            //what is the current step? - you are already at the current step
                            break;
                        case 'notRepeatIngredients':
                            speech += 'Awesome. So let us start. ' + getCurrentStep();
                            addExpectUserResponseFalse = true;
                            break;
                        case 'nextStep':
                            speech = getNextStep();
                            break;
                        case 'lastStep':
                            speech = getLastStep();
                            break;
                        case 'currentStep':
                            speech = getCurrentStep();
                            break;
                        case 'firstStep':
                            speech += chocolateBrownies.steps[0];
                            break;
                        case 'resetData':
                            resetData();
                            break;
                        case 'howDoesMethodWork':
                            speech = getMethodExplanation('waterbath');
                            addExpectUserResponseFalse = true;
                            break;
                        case 'ingredientAmount':
                            speech = getIngredientAmount(requestBody.result.parameters.ingredients);
                    }
                }
            }
        }

        /* Returned value */
        /*
         * contextOut: Such contexts are activated after intent completion.
         * example: "contextOut": [{"name":"weather","lifespan":2, "parameters":{"city":"Rome"}}]
         *
         * followupEvent: Event name and optional parameters sent from the web service to API.AI.
         * example: {"followupEvent":{"name":"<event_name>","data":{"<parameter_name>":"<parameter_value>"}}}
         */
        // Invoke Goodbye
        if (addGoodByeFollowUp) {
            return result.json({
                followupEvent: {name: 'goodBye'},
                source: 'babsi-webhook'
            });
        }
        if (addExpectUserResponseFalse) {
            addExpectUserResponseFalse = false;
            return result.json({
                speech: speech,
                displayText: speech,
                data: {
                    google: {
                        expect_user_response: false
                    }
                },
                source: 'babsi-webhook'
            });
        }
        else {
            return result.json({
                speech: speech,
                displayText: speech,
                source: 'babsi-webhook'
            });
        }
    } catch (err) {
        console.error("Can't process request", err);
        return result.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});