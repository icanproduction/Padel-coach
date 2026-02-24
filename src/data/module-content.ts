// =============================================================================
// Padel Coach Pro - Module Content (Coach Mode)
// Detailed coaching content for all 18 modules across 6 curriculums.
// =============================================================================

export interface ModuleContent {
  moduleId: string
  objective: string
  gameProblem: string
  technicalFocus: string
  successIndicators: string[]
  coneSetup: string
  coachingCues: string[]
  ahaStatement: string
}

// =============================================================================
// MODULE CONTENT - ALL 18 MODULES
// =============================================================================

export const MODULE_CONTENT: Record<string, ModuleContent> = {
  // ===========================================================================
  // CURRICULUM 1: SERVE & RETURN FOUNDATION
  // ===========================================================================

  // Module 1.1: Serve Introduction
  'serve-introduction': {
    moduleId: 'serve-introduction',
    objective:
      'Player can execute a consistent underhand serve that lands in the correct service box with controlled pace and placement.',
    gameProblem:
      'Player cannot start a point reliably. Serves go into the net, fly long, or lack any directional intent, leading to free points for the opponent.',
    technicalFocus:
      'Low contact point (waist height or below), relaxed wrist with slight continental grip, pendulum swing from the shoulder, ball drop from non-dominant hand at arm\'s length, follow through toward the target.',
    successIndicators: [
      'Player can drop the ball and make clean contact 8 out of 10 times',
      'Serve lands in the correct service box 6 out of 10 attempts',
      'Player demonstrates directional intent (can aim left or right half of the box)',
      'Serve clears the net with a comfortable margin (not scraping the tape)',
    ],
    coneSetup:
      'Place one cone at the center T of the service box and one cone in each corner of the service box (3 cones total per side). Player serves from behind the service line. Use tape or a flat marker to show the ideal contact zone at waist height.',
    coachingCues: [
      'Drop the ball out in front, not behind you',
      'Let the racket swing like a pendulum - no wrist flick',
      'Eyes on the ball at the moment of contact',
      'Follow through toward your target, not across your body',
      'Breathe out as you make contact - stay relaxed',
    ],
    ahaStatement:
      'The serve is not about power - it is about starting the point on your terms. A consistent, placed serve puts pressure on the returner without any risk to you.',
  },

  // Module 1.2: Serve & Go
  'serve-and-go': {
    moduleId: 'serve-and-go',
    objective:
      'Player can serve and immediately transition into a rally-ready position, prepared for the return.',
    gameProblem:
      'Player serves and then stands still, watches the ball, or is caught flat-footed when the return comes back. This creates a delayed reaction and poor positioning for the first exchange.',
    technicalFocus:
      'Serve follow-through flows into a split step. After serve contact, player takes 1-2 forward steps and performs a ready hop (split step) as the opponent makes contact. Racket comes back to center ready position.',
    successIndicators: [
      'Player moves forward immediately after serving (no freeze)',
      'Split step timing aligns with opponent contact on the return',
      'Racket is in ready position (in front of body) after the serve',
      'Player can play the first ball back consistently after serving',
    ],
    coneSetup:
      'Place a cone 1 meter ahead of the service position as the "go" target. Place a second cone at the ideal ready position (approximately 2 meters inside the baseline, center of the half). Player serves, moves to cone 1, split steps at cone 2.',
    coachingCues: [
      'Serve and go - your feet should never stop moving',
      'Land the split step when the returner hits the ball',
      'Racket up and in front after the serve, not dangling',
      'Small steps forward, not one big lunge',
      'Think: serve, step, hop, ready',
    ],
    ahaStatement:
      'The serve is only half the job. What you do in the 2 seconds after the serve determines whether you win or lose the first exchange.',
  },

  // Module 1.3: Return Stability
  'return-stability': {
    moduleId: 'return-stability',
    objective:
      'Player can return the serve consistently into play with controlled depth and direction, targeting the middle of the court.',
    gameProblem:
      'Player over-swings on the return, shanks the ball, or is too passive and pops it up short. The return either goes into the net, flies out, or sets up an easy volley for the serving team at the net.',
    technicalFocus:
      'Compact backswing, block-style contact with a firm wrist, early racket preparation as soon as the serve direction is read. Target is the middle of the court (between the opponents) to reduce angles and buy time.',
    successIndicators: [
      'Player returns the serve into play 7 out of 10 times',
      'Return lands past the service line (not short)',
      'Player uses a compact swing, not a full backswing',
      'Return direction is intentionally toward the center of the court',
    ],
    coneSetup:
      'Place a target zone (2 cones) in the center of the opponent\'s court, about 1 meter apart. Player stands at the return position. Coach or partner feeds serves at moderate pace. Goal is to land returns between the target cones.',
    coachingCues: [
      'Short backswing - just block it back',
      'Step into the ball, do not fall backward',
      'Aim for the middle - safe and effective',
      'Read the serve direction early and move your feet first',
      'Firm wrist at contact, let the serve pace do the work',
    ],
    ahaStatement:
      'A good return does not need to be a winner. Getting the ball back deep and in the middle forces the serving team to play another shot, and that is where mistakes happen.',
  },

  // ===========================================================================
  // CURRICULUM 2: BALL CONTROL (GROUNDSTROKE)
  // ===========================================================================

  // Module 2.1: Short Swing Control
  'short-swing-control': {
    moduleId: 'short-swing-control',
    objective:
      'Player can rally from the baseline using a compact, controlled swing that produces consistent contact and direction.',
    gameProblem:
      'Player takes a huge backswing on every ball, resulting in inconsistent contact, overhitting, and a lack of control. The ball either flies out or hits the net because the swing is too big for the situation.',
    technicalFocus:
      'Abbreviated backswing (racket goes no further than the hip on preparation). Contact point in front of the body. Smooth follow-through toward the target. Focus on timing and placement over power.',
    successIndicators: [
      'Player backswing stops at hip level consistently',
      'Ball lands in play 7 out of 10 hits during cooperative rally',
      'Contact point is visibly in front of the body',
      'Player can sustain a 6-ball rally without overhitting',
    ],
    coneSetup:
      'Place one cone at hip height next to the player as a backswing limiter (they should not take the racket past it). Place a target zone of 2 cones deep in the opponent court (2 meters from the back glass). Coach feeds from the net at moderate pace.',
    coachingCues: [
      'Small swing, big control - less is more',
      'Racket stops at your hip on the way back',
      'Hit through the ball, not at the ball',
      'Contact out in front where you can see the ball and racket together',
      'Follow through toward where you want the ball to go',
    ],
    ahaStatement:
      'In padel, the biggest swings produce the worst results. A compact swing gives you control, consistency, and time to recover. Power comes from timing, not from effort.',
  },

  // Module 2.2: Pace Absorption
  'pace-absorption': {
    moduleId: 'pace-absorption',
    objective:
      'Player can absorb incoming pace and redirect the ball with control rather than adding power to an already fast ball.',
    gameProblem:
      'When the opponent hits hard, the player either swings harder (adding pace to pace, resulting in errors) or freezes and lets the ball pass. They do not know how to take speed off the ball and redirect it.',
    technicalFocus:
      'Soft hands at contact, slightly open racket face, minimal backswing. Let the ball come to you and use a cushioning contact. Think of catching the ball on the strings rather than hitting it. Weight stays balanced, not lunging forward.',
    successIndicators: [
      'Player can return a medium-pace feed with a softer ball landing in the target zone',
      'No visible increase in swing speed when the incoming ball is faster',
      'Ball comes off the racket with reduced pace (absorption, not addition)',
      'Player stays balanced during and after contact',
    ],
    coneSetup:
      'Coach feeds from the net with varying pace (medium, then faster). Place a target zone in the center of the court. Player stands 1 meter inside the baseline. Focus zone is between the service line and the baseline.',
    coachingCues: [
      'Soft hands - imagine you are catching an egg on the strings',
      'Let the ball come to you, do not chase it',
      'Open the racket face slightly to take pace off',
      'The harder they hit, the less you swing',
      'Stay balanced on both feet - no lunging',
    ],
    ahaStatement:
      'You do not need to match your opponent\'s power. The smartest play against a hard hitter is to absorb their pace and redirect with control. Make them generate all the power while you stay comfortable.',
  },

  // Module 2.3: Direction Control
  'direction-control': {
    moduleId: 'direction-control',
    objective:
      'Player can intentionally direct groundstrokes cross-court or down the line based on tactical choice.',
    gameProblem:
      'Player hits every ball to the same spot regardless of the situation. They cannot change direction under pressure and become predictable, allowing the opponent to anticipate and dominate the rally.',
    technicalFocus:
      'Racket face angle at contact determines direction. For cross-court: contact slightly in front, racket face angled across. For down the line: contact more beside the body, racket face square to the sideline. Feet alignment supports the direction.',
    successIndicators: [
      'Player can hit 6 out of 10 balls to a called direction (cross or straight)',
      'Feet and body alignment change based on the intended direction',
      'Player can alternate directions in a cooperative rally on command',
      'Direction change does not cause a significant increase in errors',
    ],
    coneSetup:
      'Set up two target zones: one cross-court (diagonal) and one down the line (straight). Use 2 cones per zone. Coach feeds consistently to the same spot while calling "cross" or "straight" before each feed. Player must direct accordingly.',
    coachingCues: [
      'Point your strings where you want the ball to go',
      'Cross-court: contact in front, follow through across',
      'Down the line: racket face flat to the sideline',
      'Turn your shoulders to set up the direction early',
      'Decide before the ball arrives, not during the swing',
    ],
    ahaStatement:
      'Control is not about hitting harder. When you can choose where the ball goes, you control the rally. Direction is your most powerful weapon in padel.',
  },

  // ===========================================================================
  // CURRICULUM 3: COURT AWARENESS
  // ===========================================================================

  // Module 3.1: Recovery Position
  'recovery-position': {
    moduleId: 'recovery-position',
    objective:
      'Player consistently returns to a neutral recovery position after every shot, eliminating gaps and reducing vulnerability.',
    gameProblem:
      'Player hits the ball and stays where they hit it, leaving large open spaces on the court. Opponents exploit these gaps easily, and the player is always scrambling or out of position for the next shot.',
    technicalFocus:
      'After every shot, player takes 2-3 recovery steps back toward the center of their half. Recovery position is approximately 1 meter behind the service line, centered in their lane. Split step happens as the opponent makes contact.',
    successIndicators: [
      'Player moves back toward center after every shot without being reminded',
      'Recovery steps begin immediately after the follow-through',
      'Player arrives at the recovery position before the opponent hits',
      'Gaps on the court are noticeably smaller during rallies',
    ],
    coneSetup:
      'Place a "home" cone at the ideal recovery position for each player (center of their half, 1 meter behind the service line). After each feed and shot, player must touch or pass through the home cone before the next ball arrives. Coach feeds alternating sides.',
    coachingCues: [
      'Hit and move - never admire your shot',
      'Touch your home cone after every ball',
      'Small quick steps back, not one big jump',
      'Be at home before they hit, not after',
      'Recovery is not optional - it is part of the shot',
    ],
    ahaStatement:
      'The best players are not the ones who hit the hardest. They are the ones who are always in the right place. Recovery is the invisible skill that makes everything else easier.',
  },

  // Module 3.2: Spacing Awareness
  'spacing-awareness': {
    moduleId: 'spacing-awareness',
    objective:
      'Player reads the ball trajectory early and adjusts their distance from the ball before making contact, hitting from a balanced position.',
    gameProblem:
      'Player stands too close or too far from the ball, resulting in jammed contacts (too close) or stretched, off-balance hits (too far). They react to the ball instead of moving proactively to set up the right distance.',
    technicalFocus:
      'Read the ball flight path early. Adjust feet first (not racket). Ideal contact distance is approximately one arm plus racket length from the body. Move to create space when the ball comes toward you; move forward when it lands short.',
    successIndicators: [
      'Player adjusts feet before swinging on 7 out of 10 balls',
      'Contact point is consistently at arm\'s length from the body',
      'No jammed or over-stretched hits during cooperative rally',
      'Player reads the ball depth (short vs deep) and adjusts position',
    ],
    coneSetup:
      'Place a cone 1 meter from the player on each side (left and right) to create a spacing channel. Coach feeds balls at different depths and widths. Player must move to maintain the correct distance from the ball, staying within the spacing channel.',
    coachingCues: [
      'Move your feet first, then your racket',
      'If the ball comes to you, step back and create space',
      'If the ball is short, step in and take it early',
      'One arm plus racket distance - that is your sweet spot',
      'Read the ball early - decide your feet before the bounce',
    ],
    ahaStatement:
      'Good spacing is the secret to effortless shots. When you are at the right distance from the ball, the swing feels natural and the ball goes where you want. Move your feet to make every ball feel easy.',
  },

  // Module 3.3: Partner Lane Awareness
  'partner-lane-awareness': {
    moduleId: 'partner-lane-awareness',
    objective:
      'Player understands and maintains their lane responsibility in doubles, moving in sync with their partner as a unit.',
    gameProblem:
      'Both players cover the same area, leaving a lane wide open. Or one player stays fixed while the other moves, creating gaps between them. They collide, hesitate, or leave the middle completely unprotected.',
    technicalFocus:
      'Court divided into two vertical lanes. Each player owns their lane. When one player moves laterally, the partner mirrors. When one moves forward (to the net), the partner supports by adjusting depth. Constant communication and peripheral awareness.',
    successIndicators: [
      'Players maintain approximately equal distance from each other throughout the rally',
      'When one player moves left, the partner shifts left',
      'No collisions or confusion over who takes the middle ball',
      'Players communicate (call "mine" or "yours") on at least 50% of shared balls',
    ],
    coneSetup:
      'Use tape or a line of cones down the center of the court to divide lanes visually. Each player has a "home" cone in their lane. Coach feeds balls and both players must move together as a unit, staying on their side of the center line while keeping equal spacing.',
    coachingCues: [
      'Move together like you are connected by a rope',
      'If your partner moves left, you move left too',
      'The middle is shared - communicate on every ball there',
      'Check your partner with a quick glance between shots',
      'Stay in your lane - trust your partner to cover theirs',
    ],
    ahaStatement:
      'Padel is a doubles game. You win together or lose together. When you move as a team, you cover the court twice as well with half the effort.',
  },

  // ===========================================================================
  // CURRICULUM 4: WALL SURVIVAL
  // ===========================================================================

  // Module 4.1: Let Ball Pass
  'let-ball-pass': {
    moduleId: 'let-ball-pass',
    objective:
      'Player recognizes when to let the ball pass to the back glass instead of hitting it in the air, and can play the ball after it bounces off the glass.',
    gameProblem:
      'Player tries to hit every ball before it reaches the glass, often swinging awkwardly at balls behind them or turning their back to the net. This results in shanks, mis-hits, and losing court position.',
    technicalFocus:
      'Decision trigger: if the ball is above shoulder height and moving toward the back glass with pace, let it go. Step aside, track the ball visually, wait for it to bounce off the glass, then play it as it returns. Body turns sideways to maintain visual tracking.',
    successIndicators: [
      'Player lets deep, high balls pass to the glass instead of forcing a hit',
      'Player maintains visual contact with the ball throughout the glass bounce',
      'Player can catch or softly return the ball after it comes off the glass',
      'Decision to let the ball pass happens quickly (no hesitation or last-second change)',
    ],
    coneSetup:
      'Player stands at the baseline. Coach lobs balls with depth (aiming past the player to the back glass). Place a cone 1 meter from the back glass as the "let it go" line - if the ball passes this cone, the player should let it bounce off the glass. Player practices stepping aside and tracking.',
    coachingCues: [
      'If it is going past you, let it go - do not chase',
      'Step to the side and watch the ball hit the glass',
      'Turn sideways so you can see the ball and the glass',
      'Wait for it to come back to you - patience wins here',
      'The glass is your friend, not your enemy',
    ],
    ahaStatement:
      'The biggest beginners mistake in padel is trying to hit every ball before the glass. The glass gives you a second chance. Let it work for you instead of fighting it.',
  },

  // Module 4.2: Back Glass Control
  'back-glass-control': {
    moduleId: 'back-glass-control',
    objective:
      'Player can time and execute a controlled return off the back glass, putting the ball back into play with direction.',
    gameProblem:
      'Player either swings too early (before the ball fully comes off the glass) or too late (ball has already dropped too low). Timing is off, resulting in balls hit into the net or popped up weakly.',
    technicalFocus:
      'Position approximately 1.5 meters from the back glass. Let the ball bounce on the floor, hit the glass, and come back. Time the swing for when the ball is at comfortable hip height on its way back. Compact swing, lift through the ball to clear the net.',
    successIndicators: [
      'Player times contact at the correct moment (ball returning from glass at hip height)',
      'Ball clears the net and lands in the opponent court 5 out of 10 attempts',
      'Player maintains a balanced stance near the glass (not jammed against it)',
      'Contact is clean (center of the strings, not the frame)',
    ],
    coneSetup:
      'Place a cone 1.5 meters from the back glass as the player\'s "waiting position." Coach feeds lobs that bounce and hit the back glass. Player starts at the cone, lets the ball come off the glass, and returns it. Target zone is a large area in the middle of the opponent court.',
    coachingCues: [
      'Stand about two steps from the glass - give yourself room',
      'Watch the ball hit the glass and wait for it to come to you',
      'Swing low to high - you need to lift the ball over the net',
      'Contact at hip height, not down by your ankles',
      'Small swing, big follow-through upward',
    ],
    ahaStatement:
      'Playing the back glass is all about patience and position. Stand away from the glass, wait for the ball, and lift it over. Once you master this timing, lobs become easy balls instead of panic moments.',
  },

  // Module 4.3: Side Glass Introduction
  'side-glass-introduction': {
    moduleId: 'side-glass-introduction',
    objective:
      'Player can read a side glass bounce and execute a basic return, understanding how the angle changes the ball trajectory.',
    gameProblem:
      'Player is completely lost when the ball hits the side glass. They cannot predict where the ball will go after contact with the side wall and either freeze, swing wildly, or abandon the ball entirely.',
    technicalFocus:
      'Angle of incidence equals angle of reflection: the ball bounces off the side glass at the same angle it arrived. Player stands parallel to the side wall, reads the angle, and positions to meet the ball as it comes off the glass. Simple block return toward the center.',
    successIndicators: [
      'Player can predict the bounce direction off the side glass',
      'Player positions correctly to meet the ball after the side glass bounce',
      'Ball is returned into play (even if weakly) 4 out of 10 times',
      'Player does not panic or freeze when the ball hits the side glass',
    ],
    coneSetup:
      'Coach stands on the opposite side and feeds balls that bounce off the side glass at gentle angles. Place a cone where the ball is expected to arrive after the glass bounce. Player starts in the center of the court and moves to the cone to play the ball. Progress from predictable angles to varied angles.',
    coachingCues: [
      'The ball bounces off the glass like a mirror - same angle in, same angle out',
      'Watch the ball hit the glass and follow it with your eyes',
      'Position your body parallel to the side wall',
      'Just block it back to the center - no need to be fancy',
      'Move early once you see it heading for the glass',
    ],
    ahaStatement:
      'The side glass looks complicated but follows a simple rule: the ball comes off at the same angle it went in. Once you see the pattern, you can read every side glass ball.',
  },

  // ===========================================================================
  // CURRICULUM 5: NET SURVIVAL
  // ===========================================================================

  // Module 5.1: Volley Stability
  'volley-stability': {
    moduleId: 'volley-stability',
    objective:
      'Player can execute a stable, controlled volley at the net with a firm wrist and compact motion, keeping the ball in play.',
    gameProblem:
      'Player swings at volleys like groundstrokes, resulting in the ball flying everywhere. The wrist collapses on contact, the swing is too big, and there is no control. Balls go into the net or out of the court.',
    technicalFocus:
      'Continental grip, firm wrist locked at contact. No backswing - the racket starts in front of the body. Short punch forward and slightly downward. Contact point well in front of the body. Knees slightly bent for stability.',
    successIndicators: [
      'Player volleys with no visible backswing',
      'Wrist stays firm at contact (no wobble or collapse)',
      'Ball is directed downward into the opponent court 6 out of 10 times',
      'Player can sustain a 4-ball volley exchange from the net',
    ],
    coneSetup:
      'Player stands 1 meter from the net. Coach feeds gentle balls directly at the player (forehand and backhand sides alternating). Target zone is the opponent\'s service box. Place a cone behind the player to prevent them from stepping backward during the volley.',
    coachingCues: [
      'No backswing - the racket starts in front of you',
      'Punch, do not swing - short and sharp',
      'Lock your wrist like you are shaking someone\'s hand firmly',
      'Contact in front of your body where you can see it',
      'Knees bent, weight forward, stay balanced',
    ],
    ahaStatement:
      'A volley is not a mini groundstroke. It is a completely different shot. Less is more: no backswing, firm wrist, short punch. The ball does the work - you just redirect it.',
  },

  // Module 5.2: Net Positioning
  'net-positioning': {
    moduleId: 'net-positioning',
    objective:
      'Player understands optimal net positioning and recovers back to the ready position between volleys.',
    gameProblem:
      'Player stands too close to the net (gets lobbed) or too far back (cannot reach volleys). After hitting a volley, they stay planted and cannot cover the next ball. No concept of net recovery position.',
    technicalFocus:
      'Ideal net position is 2-3 meters from the net (not touching the net, not at the service line). After each volley, recover to this position with a split step. Stay on the balls of the feet. Close the net when attacking, retreat slightly when the opponent has time.',
    successIndicators: [
      'Player maintains correct distance from the net (2-3 meters)',
      'Player recovers to ready position between each volley',
      'Split step happens as the opponent makes contact',
      'Player can adjust position forward or backward based on the situation',
    ],
    coneSetup:
      'Place two cones 2 meters and 3 meters from the net to mark the "net zone." Player must stay between these cones during volley exchanges. Place a "home" cone in the center of the net zone. After each volley, player returns to the home cone. Coach feeds volleys alternating sides.',
    coachingCues: [
      'Two steps from the net, not two centimeters',
      'After every volley, come back to your home cone',
      'Stay on your toes - ready to move in any direction',
      'Split step when they hit, move when you read',
      'If they lob, you are already in position to retreat',
    ],
    ahaStatement:
      'Net position is like a goalkeeper\'s stance: close enough to cover the shot, far enough to react. Find your zone and always come back to it. Position wins more points than power at the net.',
  },

  // Module 5.3: Bandeja Introduction
  'bandeja-introduction': {
    moduleId: 'bandeja-introduction',
    objective:
      'Player can execute a basic bandeja (overhead slice) to neutralize lobs while maintaining net position.',
    gameProblem:
      'When lobbed, the player either lets the ball go over their head (losing the net position) or attempts a wild smash that goes out. They have no controlled overhead option to stay at the net and keep the pressure on.',
    technicalFocus:
      'Continental grip, side-on position (non-dominant shoulder toward the net). Contact above and in front of the dominant shoulder. Slice underneath the ball to create backspin. Aim deep and to the center, not for a winner. Controlled power, not maximum effort.',
    successIndicators: [
      'Player turns sideways for the overhead preparation',
      'Contact point is above the shoulder (not behind the head)',
      'Ball lands in the opponent court with some backspin 4 out of 10 times',
      'Player maintains net position after the bandeja (does not retreat to the baseline)',
    ],
    coneSetup:
      'Player stands in the net zone (2-3 meters from the net). Coach lobs gently from the opposite baseline. Target zone is deep in the center of the opponent court (place 2 cones). Player hits the bandeja and recovers to the net position cone.',
    coachingCues: [
      'Turn sideways - non-dominant shoulder points to the net',
      'Contact above your shoulder, not behind your head',
      'Slice under the ball - imagine cutting a loaf of bread',
      'Aim deep and center, not for the lines',
      'Hit and stay at the net - the bandeja keeps you there',
    ],
    ahaStatement:
      'The bandeja is the most important shot in padel that most beginners never learn. It is not a smash - it is a controlled slice that says "I am staying at the net and you cannot lob me out." It is your net survival tool.',
  },

  // ===========================================================================
  // CURRICULUM 6: RALLY MANAGEMENT
  // ===========================================================================

  // Module 6.1: Cooperative Rally
  'cooperative-rally': {
    moduleId: 'cooperative-rally',
    objective:
      'Player can sustain a cooperative rally with a partner, maintaining consistent pace and placement without trying to win the point.',
    gameProblem:
      'Player cannot keep a rally going for more than 3-4 balls. They either go for a winner too early, make unforced errors by overhitting, or lose concentration and mishit. Every rally ends prematurely.',
    technicalFocus:
      'Consistent tempo (not too fast, not too slow). Target the center of the court to maintain the rally. Compact swing on every ball. Focus on rhythm and repetition. Mental discipline to resist the urge to hit a winner.',
    successIndicators: [
      'Player can sustain a 10-ball cooperative rally',
      'Pace is consistent (no sudden acceleration or deceleration)',
      'Balls land in the center zone of the court (not the corners)',
      'Player demonstrates patience and does not attempt winners',
    ],
    coneSetup:
      'Set up a large target zone in the center of each side (4 cones forming a rectangle, approximately 3 meters wide and 2 meters deep). Both players rally cooperatively trying to keep the ball within the target zones. Count balls out loud to build rhythm and track progress.',
    coachingCues: [
      'No winners allowed - the goal is to keep the ball alive',
      'Same pace every ball - find a rhythm you can maintain',
      'Aim for the big target in the middle',
      'Count out loud with your partner - make it a team challenge',
      'If you can control 10 balls, you can control a game',
    ],
    ahaStatement:
      'The player who can rally longer wins more points in padel. Winners come from patience, not from force. Learn to keep the ball in play and your opponent will make the mistakes.',
  },

  // Module 6.2: Attack vs Defense Awareness
  'attack-vs-defense': {
    moduleId: 'attack-vs-defense',
    objective:
      'Player can recognize whether they are in an attacking or defensive position and make appropriate shot decisions accordingly.',
    gameProblem:
      'Player treats every ball the same way regardless of the tactical situation. They attack from defensive positions (resulting in errors) and play passively from attacking positions (wasting opportunities). No situational awareness.',
    technicalFocus:
      'Simple traffic light system: Green (at the net, ball is below net height on opponent side) = attack. Yellow (at baseline, neutral rally) = control and wait. Red (pushed behind baseline, opponent at net) = defend and reset. Shot selection matches the situation color.',
    successIndicators: [
      'Player correctly identifies their situation as attack, neutral, or defense',
      'Defensive shots are high and deep (lobs or high returns)',
      'Attacking shots are directed and placed (not wild power shots)',
      'Player transitions between attack and defense without panic',
    ],
    coneSetup:
      'Place colored cones or markers in three zones: Green zone at the net, Yellow zone at the baseline, Red zone behind the baseline. Coach feeds balls and calls a color. Player must respond with the appropriate shot type. Progress to player self-identifying the situation.',
    coachingCues: [
      'Green means go - you are attacking, place the ball',
      'Yellow means wait - keep the rally alive, look for green',
      'Red means survive - get the ball high and deep, reset the point',
      'Ask yourself: am I attacking or defending right now?',
      'Never attack from red - that is how you lose easy points',
    ],
    ahaStatement:
      'Padel is a game of knowing when to push and when to survive. The best players do not attack every ball. They wait for their moment, survive when needed, and strike when the opportunity is clear.',
  },

  // Module 6.3: Open Play Simulation
  'open-play-simulation': {
    moduleId: 'open-play-simulation',
    objective:
      'Player can apply all learned skills in a game-like scenario with guided coaching intervention, demonstrating tactical decision-making under pressure.',
    gameProblem:
      'Player performs well in drills but falls apart in actual game situations. The transition from controlled practice to live play creates confusion, panic, and a reversion to bad habits. Skills learned in isolation do not transfer to the game.',
    technicalFocus:
      'Integration of all previously learned skills in a live game context. Coach pauses play at key moments to guide decisions. Focus on applying the correct skill at the correct time: serve and position, return and recover, rally with patience, defend when pressured, attack when the opportunity appears.',
    successIndicators: [
      'Player applies at least 3 different learned skills during a simulated game',
      'Player recovers to position between most shots',
      'Decision-making improves over the course of the session (fewer panic shots)',
      'Player can verbalize why they chose a particular shot after a rally ends',
    ],
    coneSetup:
      'Standard doubles court setup. Use the previously learned cone positions as reminders (recovery cone, net zone cones, target zone cones). Coach stands courtside with the ability to pause play by calling "freeze." After freezing, coach discusses the situation and the best option, then play resumes.',
    coachingCues: [
      'Play the game, not the drill - everything you have learned applies here',
      'Freeze - what is the situation right now? What should you do?',
      'Good decision, even if the execution was not perfect',
      'Remember your recovery position between every shot',
      'This is real padel now - trust what you have practiced',
    ],
    ahaStatement:
      'All the drills, all the techniques, all the positioning - it all comes together on the court. You are not just hitting a ball anymore. You are playing padel. Trust your training and make smart decisions.',
  },
}

/**
 * Gets the module content for a given module ID.
 * Returns undefined if the module content is not found.
 */
export function getModuleContent(moduleId: string): ModuleContent | undefined {
  return MODULE_CONTENT[moduleId]
}

/**
 * Gets all module IDs that have content defined.
 */
export function getModuleIdsWithContent(): string[] {
  return Object.keys(MODULE_CONTENT)
}
