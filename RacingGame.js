/**************************************************************************************************\
*
* vim: ts=3 sw=3 et wrap co=100 go-=b
*
* Filename: "RacingGame.js"
*
* Project: RacingGame.
*
* Purpose: Definition of the RacingGame object.
*
* Author: Tom McDonnell 2007.
*
\**************************************************************************************************/

// Functions. //////////////////////////////////////////////////////////////////////////////////////

/*
 *
 */
function RacingGame(canvasIdAttr, sidePanelIdAttr)
{
   var f = 'RacingGame()';
   UTILS.checkArgs(f, arguments, ['string', 'string']);

   // Public functions. /////////////////////////////////////////////////////////////////////////

   /*
    *
    */
   this.init = function ()
   {
      var f = 'RacingGame.init()';
      UTILS.checkArgs(f, arguments, []);

      const body = document.querySelector('body');

      body.appendChild(racer.getImg());
      body.appendChild(ghost.getImg());

      mousePos = racer.pos.clone();

      window.addEventListener('mousemove', onMouseMove, false);

      setInterval(onTimerFire, deltaTime);
   };


   // Private functions. ////////////////////////////////////////////////////////////////////////

   /*
    * Main game loop.
    */
   function onTimerFire()
   {
      try
      {
         var f = 'onTimerFire()';
         UTILS.checkArgs(f, arguments, []);

         if (ghostLap !== null && typeof ghostLap[lapTime] != 'undefined')
         {
            ghost.setPos(ghostLap[lapTime]);
         }

         // NOTE: Must convert mousePos to raceTrack coordinates to match racer.pos before
         //       calculating vectorRacerMouse.  Must also convert back since otherwise if mouse
         //       stops moving, mousePos will be in incorrect coordinates.
         raceTrack.convertCoordinatesWindowToTrack(mousePos);
         var vectorRacerMouse = mousePos.subtract(racer.pos);
         raceTrack.convertCoordinatesTrackToWindow(mousePos);

         var lapStatus = racer.accelerate(vectorRacerMouse.getAngle(), deltaTime);

         switch (lapStatus)
         {
          case -1:
            // Start/finish line has been crossed in backward direction.
            lapTime = null;
            break;
          case  0:
            // Start/finish line has not been crossed.
            if (lapTime !== null)
            {
               lapTime += deltaTime;
               racerLap[lapTime] = racer.pos;
            }
            break;
          case  1:
            // Start/finish line has been crossed in forward direction.
            if (lapTime !== null)
            {
//               sidePanel.addCompletedLapTime(lapTime);

               if (lapTime < bestTimeThisSession)
               {
                  ghostLap = racerLap;
               }
            }
            lapTime = 0;
            racerLap = [];
            break;
          default:
            throw new Exception(f, 'Unknown lapStatus.', 'Expected -1, 0, or 1.');
         }

//         sidePanel.setCurrentLapTime(lapTime);
      }
      catch (e)
      {
         UTILS.printExceptionToConsole(f, e);
      }
   }

   /*
    *
    */
   function onMouseMove(e)
   {
      try
      {
         // Optimised for speed. var f = 'onMouseMove';
         // Optimised for speed. UTILS.checkArgs(f, arguments, ['MouseEvent']);

         mousePos.setX(e.clientX);
         mousePos.setY(e.clientY);
      }
      catch (e)
      {
         UTILS.printExceptionToConsole(f, e);
      }
   }

   // Private variables. ////////////////////////////////////////////////////////////////////////

   var raceTrack = new RaceTrack(canvasIdAttr, sidePanelIdAttr);
   var racer     = new Racer(raceTrack, IMG({src: 'images/racers/racer5.jpg'}), 2);
   var ghost     = new Racer(raceTrack, IMG({src: 'images/racers/ghost5.jpg'}), 2);
   var racerLap  = null;
   var ghostLap  = null;
   var mousePos  = null;
   var lapTime   = null;

   const sidePanel = document.getElementById(sidePanelIdAttr);
   const deltaTime = 40;
}

/*******************************************END*OF*FILE********************************************/
