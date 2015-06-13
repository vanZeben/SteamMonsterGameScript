var debug=false;var clicksPerSecond=50;var autoClickerVariance=Math.floor(clicksPerSecond/10);var respawnCheckFreq=5000;var targetSwapperFreq=1000;var abilityUseCheckFreq=2000;var itemUseCheckFreq=5000;var seekHealingPercent=20;var useMedicsAtPercent=30;var useNukeOnSpawnerAbovePercent=75;var useMetalDetectorOnBossBelowPercent=30;var autoClickerFreq=1000;var autoRespawner,autoClicker,autoTargetSwapper,autoTargetSwapperElementUpdate,autoAbilityUser,autoItemUser;var elementUpdateRate=60000;var userElementMultipliers=[1,1,1,1];var userMaxElementMultiiplier=1;var swapReason;function startAutoClicker(){if(autoClicker){console.log("Autoclicker is already running!");return}autoClicker=setInterval(function(){if(!gameRunning())return;var randomVariance=Math.floor(Math.random()*autoClickerVariance*2)-(autoClickerVariance);var clicks=clicksPerSecond+randomVariance;g_Minigame.m_CurrentScene.m_nClicks=clicks;if(debug)console.log('Clicking '+clicks+' times this second.')},autoClickerFreq);console.log("autoClicker has been started.")}function startAutoRespawner(){if(autoRespawner){console.log("autoRespawner is already running!");return}autoRespawner=setInterval(function(){if(!gameRunning())return;if(debug)console.log('Checking if the player is dead.');if(g_Minigame.m_CurrentScene.m_bIsDead){if(debug)console.log('Player is dead. Respawning.');RespawnPlayer()}},respawnCheckFreq);console.log("autoRespawner has been started.")}function startAutoTargetSwapper(){if(autoTargetSwapper){console.log("autoTargetSwapper is already running!");return}updateUserElementMultipliers();autoTargetSwapperElementUpdate=setInterval(updateUserElementMultipliers,elementUpdateRate);autoTargetSwapper=setInterval(function(){if(!gameRunning())return;var currentTarget=null;g_Minigame.m_CurrentScene.m_rgEnemies.each(function(potentialTarget){if(currentTarget==null||compareMobPriority(potentialTarget,currentTarget)>0){currentTarget=potentialTarget}});if(currentTarget!=null&&currentTarget!=g_Minigame.m_CurrentScene.m_rgEnemies[g_Minigame.m_CurrentScene.m_rgPlayerData.target]){if(debug){console.log("switching targets");console.log(swapReason)}if(g_Minigame.m_CurrentScene.m_rgPlayerData.current_lane!=currentTarget.m_nLane)g_Minigame.m_CurrentScene.TryChangeLane(currentTarget.m_nLane);g_Minigame.m_CurrentScene.TryChangeTarget(currentTarget.m_nID)}else if(currentTarget!=null&&currentTarget==currentTarget&&g_Minigame.m_CurrentScene.m_rgPlayerData.current_lane!=currentTarget.m_nLane){g_Minigame.m_CurrentScene.TryChangeLane(currentTarget.m_nLane)}},targetSwapperFreq);console.log("autoTargetSwapper has been started.")}function startAutoAbilityUser(){if(autoAbilityUser){console.log("autoAbilityUser is already running!");return}autoAbilityUser=setInterval(function(){if(!gameRunning())return;if(debug)console.log("Checking if it's useful to use an ability.");var percentHPRemaining=g_Minigame.CurrentScene().m_rgPlayerData.hp/g_Minigame.CurrentScene().m_rgPlayerTechTree.max_hp*100;var target=g_Minigame.m_CurrentScene.m_rgEnemies[g_Minigame.m_CurrentScene.m_rgPlayerData.target];var targetPercentHPRemaining;if(target)targetPercentHPRemaining=target.m_data.hp/target.m_data.max_hp*100;if(hasAbility(5)){}if(hasAbility(6)){}if(percentHPRemaining<=useMedicsAtPercent&&!g_Minigame.m_CurrentScene.m_bIsDead){if(debug)console.log("Health below threshold. Need medics!");if(hasAbility(7)){if(debug)console.log("Unleash the medics!");castAbility(7)}else if(debug)console.log("No medics to unleash!")}if(target!=undefined&&target.m_data.type==2&&targetPercentHPRemaining<=useMetalDetectorOnBossBelowPercent){if(hasAbility(8)){if(debug)console.log('Using Metal Detector.');castAbility(8)}}if(hasAbility(9)&&!currentLaneHasAbility(9)){if(debug)console.log('Decreasing cooldowns.');castAbility(9)}if(target!=undefined&&target.m_data.type==0&&targetPercentHPRemaining>=useNukeOnSpawnerAbovePercent){if(hasAbility(10)){if(debug)console.log('Nuclear launch detected.');castAbility(10)}}if(hasAbility(11)){}if(hasAbility(12)){}},abilityUseCheckFreq);console.log("autoAbilityUser has been started.")}function startAutoItemUser(){if(autoItemUser){console.log("autoItemUser is already running!");return}autoItemUser=setInterval(function(){if(!gameRunning())return;if(debug)console.log("Checking if it's useful to use an item.")},itemUseCheckFreq);console.log("autoItemUser has been started.")}function startAllAutos(){startAutoClicker();startAutoRespawner();startAutoTargetSwapper();startAutoAbilityUser();startAutoItemUser()}function stopAutoClicker(){if(autoClicker){clearInterval(autoClicker);autoClicker=null;console.log("autoClicker has been stopped.")}else console.log("No autoClicker is running to stop.")}function stopAutoRespawner(){if(autoRespawner){clearInterval(autoRespawner);autoRespawner=null;console.log("autoRespawner has been stopped.")}else console.log("No autoRespawner is running to stop.")}function stopAutoTargetSwapper(){if(autoTargetSwapper){clearInterval(autoTargetSwapper);autoTargetSwapper=null;console.log("autoTargetSwapper has been stopped.")}else console.log("No autoTargetSwapper is running to stop.")}function stopAutoAbilityUser(){if(autoAbilityUser){clearInterval(autoAbilityUser);autoAbilityUser=null;console.log("autoAbilityUser has been stopped.")}else console.log("No autoAbilityUser is running to stop.")}function stopAutoItemUser(){if(autoItemUser){clearInterval(autoItemUser);autoItemUser=null;console.log("autoItemUser has been stopped.")}else console.log("No autoItemUser is running to stop.")}function stopAllAutos(){stopAutoClicker();stopAutoRespawner();stopAutoTargetSwapper();stopAutoAbilityUser();stopAutoItemUser()}function disableAutoNukes(){useNukeOnSpawnerAbovePercent=200;console.log('Automatic nukes have been disabled')}function castAbility(abilityID){if(hasAbility(abilityID))g_Minigame.CurrentScene().TryAbility(document.getElementById('ability_'+abilityID).childElements()[0])}function currentLaneHasAbility(abilityID){return g_Minigame.m_CurrentScene.m_rgLaneData[g_Minigame.CurrentScene().m_rgPlayerData.current_lane].abilities[abilityID]}function hasAbility(abilityID){return((1<<abilityID)&g_Minigame.CurrentScene().m_rgPlayerTechTree.unlocked_abilities_bitfield)&&g_Minigame.CurrentScene().GetCooldownForAbility(abilityID)<=0}function updateUserElementMultipliers(){if(!gameRunning())return;userElementMultipliers[0]=g_Minigame.m_CurrentScene.m_rgPlayerTechTree.damage_multiplier_air;userElementMultipliers[1]=g_Minigame.m_CurrentScene.m_rgPlayerTechTree.damage_multiplier_earth;userElementMultipliers[2]=g_Minigame.m_CurrentScene.m_rgPlayerTechTree.damage_multiplier_fire;userElementMultipliers[3]=g_Minigame.m_CurrentScene.m_rgPlayerTechTree.damage_multiplier_water;userMaxElementMultiiplier=Math.max.apply(null,userElementMultipliers)}function getMobTypePriority(potentialTarget){mobType=potentialTarget.m_data.type;switch(mobType){case 0:return 0;case 3:return 1;case 2:return 2;case 4:return 3}return-Number.MAX_VALUE}function compareMobPriority(mobA,mobB){var percentHPRemaining=g_Minigame.CurrentScene().m_rgPlayerData.hp/g_Minigame.CurrentScene().m_rgPlayerTechTree.max_hp*100;var aHasHealing=g_Minigame.m_CurrentScene.m_rgLaneData[mobA.m_nLane].abilities[7];var bHasHealing=g_Minigame.m_CurrentScene.m_rgLaneData[mobB.m_nLane].abilities[7];var aIsGold=g_Minigame.m_CurrentScene.m_rgLaneData[mobA.m_nLane].abilities[17];var bIsGold=g_Minigame.m_CurrentScene.m_rgLaneData[mobB.m_nLane].abilities[17];var aTypePriority=getMobTypePriority(mobA);var bTypePriority=getMobTypePriority(mobB);var aElemMult=userElementMultipliers[g_Minigame.m_CurrentScene.m_rgGameData.lanes[mobA.m_nLane].element];var bElemMult=userElementMultipliers[g_Minigame.m_CurrentScene.m_rgGameData.lanes[mobB.m_nLane].element];if(g_Minigame.m_CurrentScene.m_rgLaneData[mobA.m_nLane].abilities[16])aElemMult=userMaxElementMultiiplier;if(g_Minigame.m_CurrentScene.m_rgLaneData[mobB.m_nLane].abilities[16])bElemMult=userMaxElementMultiiplier;var aHP=mobA.m_data.hp;var bHP=mobB.m_data.hp;if(percentHPRemaining<=seekHealingPercent&&!g_Minigame.m_CurrentScene.m_bIsDead){if(aHasHealing!=bHasHealing){swapReason="Swapping to lane with active healing.";return(aHasHealing?1:-1)}}if(aIsGold!=bIsGold){swapReason="Switching to target with Raining Gold.";return(aIsGold?1:-1)}if(aTypePriority!=bTypePriority){swapReason="Switching to higher priority target.";return aTypePriority-bTypePriority}if(aElemMult!=bElemMult){swapReason="Switching to elementally weaker target.";return aElemMult-bElemMult}if(aHP!=bHP){swapReason="Switching to lower HP target.";return aHP-bHP}return 0}function gameRunning(){return typeof g_Minigame==="object"}if(typeof unsafeWindow!='undefined'){unsafeWindow.startAutoClicker=startAutoClicker;unsafeWindow.startAutoRespawner=startAutoRespawner;unsafeWindow.startAutoTargetSwapper=startAutoTargetSwapper;unsafeWindow.startAutoAbilityUser=startAutoAbilityUser;unsafeWindow.startAutoItemUser=startAutoItemUser;unsafeWindow.startAllAutos=startAllAutos;unsafeWindow.stopAutoClicker=stopAutoClicker;unsafeWindow.stopAutoRespawner=stopAutoRespawner;unsafeWindow.stopAutoTargetSwapper=stopAutoTargetSwapper;unsafeWindow.stopAutoAbilityUser=stopAutoAbilityUser;unsafeWindow.stopAutoItemUser=stopAutoItemUser;unsafeWindow.stopAllAutos=stopAllAutos;unsafeWindow.disableAutoNukes=disableAutoNukes;unsafeWindow.castAbility=castAbility;unsafeWindow.hasAbility=hasAbility}startAllAutos();