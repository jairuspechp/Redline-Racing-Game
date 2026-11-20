window.Race = {};

Race.WORD_COUNT = 40;

Race.LEVELS = [
  {n:"Easy",   wpm:22, err:.09},
  {n:"Medium", wpm:38, err:.06},
  {n:"Hard",   wpm:58, err:.04},
  {n:"Insane", wpm:85, err:.025}
];

Race.BOTS = [
  {n:"Rook", c:"#4aa3ff"},
  {n:"Vex",  c:"#b57bff"},
  {n:"Mako", c:"#3ddbd0"}
];

Race.WORDS = "accuracy amber anchor ancient apple arrow asphalt balance banner basket bottle brake brave breeze bridge bright building cactus calm candle captain carrying castle chasing clever climbing cloud control copper corner cruising dancer desert distant dolphin dragon dream drifting eagle earth ember engine evening falcon feather fierce fingers finishing flame flying forest frost galaxy garden gentle ghost glacier glowing golden grape gravity hammer harbor harvest heavy helmet hidden honey horizon igloo input island ivory jacket jasmine jewel journey jumping jungle kettle keyboard kitchen knight koala ladder lantern leaning legend lemon letters light magnet marble market meadow mirror modern moon morning mountain mystery narrow nectar needle nickel night ocean olive orange orbit painting paragraph passing pattern pearl pepper pillow planet pocket practice puzzle quartz queen quiet quiver rabbit racing rain rapid reading rhythm ribbon river road rocket running saddle sentence shadow sharp signal silent silver simple speed steady stone swift tension throttle thunder tiger timber train tunnel turning typing umbrella unicorn update urban valley vehicle velvet victory violet vision voice walnut water weather whisper window winter wonder xenon yellow yogurt yonder young zebra zenith zipper zone".split(" ");
