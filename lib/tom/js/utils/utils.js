/****************************************************************************************************************************************************\
*
* vim: ts=3 sw=3 et wrap co=150 go-=b
*
* Filename: "utils.js"
*
* Project: Utilities.
*
* Purpose: Useful general functions and objects.
*
* @author: Tom McDonnell 2007.
*
\****************************************************************************************************************************************************/

// Global variables. /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Namespace for general utility objects and functions.
 */
var UTILS = {};

// Global objects. ---------------------------------------------------------------------------------------------------------------------------------//

/**
 * Exception object definition.
 *
 * If this object was defined in the style of: "UTILS.Exception = function (...) {...}", its type would be "function()", and it would be
 * indistinguishable from any other anonymous function.  That is why it is defined outside the 'UTILS' namespace.
 *
 * @param f    {String} The name of the function throwing the exception.
 * @param desc {String} A short description of what went wrong.
 */
function Exception(f, desc)
{
   // NOTE
   // ----
   // Function UTILS.checkArgs() is not used here to avoid recursion.
   // Better to keep things simple for exception functions.

   if (arguments.length == 2 && f.constructor == String && desc.constructor == String)
   {
      this.f    = f;
      this.desc = desc;
   }
   else
   {
      console.error
      (
         'Error detected.'                          +
         '\n  Function: Exception()'                +
         '\n  Type    : Incorrect arguments.'       +
         '\n  Details : Expected [String, String].' +
         '\n            Received ', arguments, '.'
      );
   }
};

// Namespace 'UTILS' functions. --------------------------------------------------------------------------------------------------------------------//

/**
 * Print an error message to the Firebug console.
 *
 * @params e {UTILS.Exception}
 */
UTILS.printExceptionToConsole = function (f, e)
{
   // NOTE
   // ----
   // Must not call functions that throw exceptions from here.
   // Reason: This function is intended to be called from within a catch block.

   // If the arguments supplied to this function are correct...
   if (arguments.length == 2 && f.constructor == String && typeof e != 'undefined')
   {
      // Print the information given in the supplied exception.
      if (e.constructor == Exception)
      {
         console.info
         (
            'Exception caught in function ' + f + '.' +
            '\n  Function: ' + e.f          +
            '\n  Desc    : ' + e.desc
         );

         if (console.trace !== undefined) {console.trace();} // Console.trace is undefined in IE8.
      }
      else
      {
         console.info('In function ', f);
         console.info(e);
         if (console.trace !== undefined) {console.trace();} // Console.trace is undefined in IE8.
      }
   }
   else
   {
      console.info
      (
         'Error detected.'                               +
         '\n  Function: UTILS.printExceptionToConsole()' +
         '\n  Type    : Incorrect arguments.'            +
         "\n  Details : Expected [String, 'Defined']."   +
         '\n            Received ', arguments, '.'
      );
      console.trace();
   }
};

/**
 * Check the arguments supplied to a function.
 * Throw an exception if an incorrect number of arguments were supplied, or if the arguments supplied are not of the expected type.
 *
 * @param f     {String} The name of the calling function.
 * @param args  {Object} Array of arguments supplied to the function.
 * @param types {Array } Array of expected types for the arguments.
 */
UTILS.checkArgs = function (f, args, types)
{
   if (arguments.length != 3 || f.constructor != String || args.constructor != Object || types.constructor != Array)
   {
      throw new Exception('UTILS.checkArgs()', 'Incorrect arguments.\nExpected [String, Object, Array].');
   }

   if (UTILS.validator === undefined)
   {
      throw new Exception('UTILS.checkArgs()', 'UTILS.validator is undefined.  Check that /tom/js/utils/utilsValidtor.js is included.');
   }

   // Check that the number of arguments supplied to 'f' is correct.
   if (args.length != types.length)
   {
      throw new Exception
      (
         f, 'Incorrect number of arguments.\n'  +
         '            Expected ' + types.length + '.\n' +
         '            Received ' + args.length  + '.'
      );
   }

   // Check that the types of arguments supplied to 'f' are correct.
   var type, arg;
   for (var i = 0; i < args.length; ++i)
   {
      type = types[i];
      arg  = args[i];

      if (type.constructor !== String)
      {
         throw new Exception('UTILS.checkArgs()', 'Non-string supplied as type.');
      }

      if (type == 'Defined' && typeof arg != 'undefined')
      {
         continue;
      }

      try
      {
         UTILS.validator.checkType(arg, type);
      }
      catch (e)
      {
         throw new Exception
         (
            f, 'Incorrect type for argument['  + i + '].\n' +
            '               Expected "' + type +     '".\n' +
            '               Received "' +
            ((typeof arg == 'undefined' || arg === null)? arg: arg.constructor) + '".'
         );
      }
   }
};

/*
 * Confirm that the expression given is true.
 *
 * @param functionName {String}  The name of the calling function.
 * @param assertNo     {Number}  The number of the assert (should be unique for the function).
 * @param expression   {Boolean} An expression expected to evaluate as 'true'.
 */
UTILS.assert = function (functionName, assertNo, expression)
{
   var f = 'UTILS.assert()';
   if (functionName.constructor != String || assertNo.constructor != Number || expression.constructor != Boolean)
   {
      throw new Exception(f, 'Incorrect types supplied.  Expected [String, Number, Boolean].');
   }

   if (!expression)
   {
      throw new Exception(f, 'Assertion ' + assertNo + ' failed in function "' + functionName + '".');
   }
};

/*
 * Confirm that the variable given is equal to one of the elements in the options array.
 *
 * @param functionName {String} The name of the calling function.
 * @param assertNo     {Number} The number of the assert (should be unique for the function).
 * @param variable              The variable to be tested.
 * @param options      {Array}  Array containing all expected values of variable.
 */
UTILS.assertEqualsOneOf = function (functionName, assertNo, variable, options)
{
   var f = 'UTILS.assertEqualsOneOf()';
   UTILS.checkArgs(f, arguments, ['string', 'int', 'Defined', 'array']);

   for (var i = 0; i < options.length; ++i)
   {
      if (variable == options[i]) return;
   }

   throw new Exception(f, 'Assertion ' + assertNo + ' failed in function "' + functionName + '".');
};

/*
 * Usage example:
 *    var bestSellingCarModelName = UTILS.switchAssign
 *    (
 *       carManufacturer,
 *       {
 *          ford  : 'falcon',
 *          holden: 'commodore'
 *       }
 *    );
 *
 * The above code is equivalent to:
 *    switch (carManufacturer)
 *    {
 *     case 'ford'  : var bestSellingCarModelName = 'falcon'   ; break;
 *     case 'holden': var bestSellingCarModelName = 'commodore'; break;
 *     default      : throw new Exception('Unknown car manufacturer "' + carManufacturer + '".');
 *    }
 *
 * @param defaultOutputValue {any type}
 *     This parameter is optional.  If it is not supplied, there will be no output value
 *     for the default case specified and so an exception will be thrown in the default case.
 */
UTILS.switchAssign = function (inputValue, outputValueByInputValue, defaultOutputValue)
{
   var f = 'UTILS.switchAssign()';
   UTILS.assert(f, 0, arguments.length == 2 || arguments.length == 3);
   UTILS.assert(f, 1, inputValue.constructor === Number || inputValue.constructor == String);
   UTILS.assert(f, 2, outputValueByInputValue.constructor === Object);

   if (typeof outputValueByInputValue[inputValue] != 'undefined')
   {
      return outputValueByInputValue[inputValue];
   }

   if (arguments.length > 2)
   {
      return defaultOutputValue;
   }

   throw new Exception(f, 'Case "' + inputValue + '" not handled in switchAssign and no default supplied.');
};

UTILS.getKeyCodeForEvent = function (ev)
{
   var f = 'UTILS.getKeyCodeForEvent()';
   UTILS.checkArgs(f, arguments, ['object']);

   // Note Regarding Browser Compatibility
   // ------------------------------------
   // Explorer doesn't fire the keypress event for delete, end, enter, escape, function keys, home, insert, pageUp/Down and tab.
   // If you need to detect these keys, search for their keyCode using onkeydown/onkeyup, and ignore both onkeypress and charCode.
   // http://stackoverflow.com/questions/4084715/javascript-e-keycode-doesnt-catch-backspace-del-in-ie
   return (window.event == undefined)? ev.which: ev.keyCode;
};

/*
 * See http://stackoverflow.com/questions/3700326/decode-amp-back-to-in-javascript.
 */
UTILS.decodeUrl = function (encodedUrl)
{
   var textareaJq = $(document.createElement('textarea'));
   $('body').append(textareaJq);
   textareaJq.html(encodedUrl);
   var decodedUrl = textareaJq.val();
   textareaJq.remove();
   return decodedUrl;
};

/********************************************************************END*OF*FILE*********************************************************************/
