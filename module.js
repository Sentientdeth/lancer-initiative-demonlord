Hooks.once("init", function() {
	console.log("Combat Tracker Enhancements | Initializing");

	function updateInitiativeDisplay() {
		$('.initiative').each(function() {
			const $this = $(this);
			const value = parseInt($this.text());
			
			if (value === 0 || value === 20) {
				$this.text("Slow Turn")
					.css('color', '#1e90ff')
					.css('cursor', 'pointer')
					.attr('title', 'Click to toggle Fast/Slow turn');
			} else if (value === 50 || value === 70) {
				$this.text("Fast Turn")
					.css('color', '#FFD700')
					.css('cursor', 'pointer')
					.attr('title', 'Click to toggle Fast/Slow turn');
			}
		});
	}

	function addInitiativeClickHandler() {
		const combatTracker = document.getElementById('combat-tracker');
		if (combatTracker) {
			combatTracker.removeEventListener('click', initiativeClickHandler, true);
			combatTracker.addEventListener('click', initiativeClickHandler, true);
		}
	}

	async function initiativeClickHandler(event) {
		let target = event.target;
		if (!target.classList.contains('initiative')) {
			target = target.closest('.initiative');
		}
		if (!target) return;
			
		event.preventDefault();
		event.stopPropagation();
		
		const $this = $(target);
		const combatantId = $this.closest('.combatant').data('combatant-id');
		const combatant = game.combat?.combatants.get(combatantId);
		
		if (combatant?.actor) {
			const actor = combatant.actor;
			const currentFastTurn = actor.system.fastturn;
			const newFastTurn = currentFastTurn === true ? false : true;
			
			try {
				await actor.update({'system.fastturn': newFastTurn});
				const updatedActor = combatant.actor;
				const isPC = updatedActor.system.isPC;
				const newInitiative = isPC ? 
					(newFastTurn ? 70 : 20) : 
					(newFastTurn ? 50 : 0);
				await combatant.update({initiative: newInitiative});
			} catch (err) {
				console.error('Error toggling fastturn:', err);
			}
		}
	}

	Hooks.on("ready", function() {
		updateInitiativeDisplay();
		addInitiativeClickHandler();
	});

	Hooks.on("updateCombat", updateInitiativeDisplay);
	Hooks.on("renderCombatTracker", function() {
		updateInitiativeDisplay();
		addInitiativeClickHandler();
	});
});