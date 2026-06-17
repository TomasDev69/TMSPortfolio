document.querySelectorAll('.gallery .image img').forEach(image => {
    console.log("Immagine selezionata:", image); // Debug: visualizza l'elemento immagine selezionato
    image.addEventListener('contextmenu', addWatermark);
    image.addEventListener('click', addWatermark);
});

function addWatermark(event) {
    event.preventDefault(); // Prevenire il comportamento predefinito del clic destro o del clic

    const imageUrl = event.target.src; // Ottenere l'URL dell'immagine
    console.log("URL dell'immagine:", imageUrl); // Debug: visualizza l'URL dell'immagine

    // Aprire l'immagine in una nuova scheda
    const newWindow = window.open(imageUrl, '_blank');
    console.log("Nuova scheda:", newWindow); // Debug: visualizza la nuova finestra

	if (!newWindow || newWindow.closed || newWindow.closed === undefined) {
		// Se l'immagine è stata aperta in una nuova scheda
		console.log("Immagine aperta in una nuova scheda"); // Debug: conferma che l'immagine sia stata aperta in una nuova scheda
		document.body.insertAdjacentHTML('beforeend', `<div class="watermark">Watermark</div>`);
	}

}

