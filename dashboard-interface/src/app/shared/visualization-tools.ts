export class VisualizationTools {
	public static getRandomHexColor(): string {
		let rndColor = Math.floor(Math.random() * 16777215).toString(16);
		return this._fillHexColorZeros(rndColor);
	}

	private static _fillHexColorZeros(hexColor: string): string {
		let numOfZeros = 6 - hexColor.length;
		let newHexColor = hexColor;
		for(let i=0; i<numOfZeros; i++){
			newHexColor = '0' + newHexColor;
		}
		return newHexColor;
	}
}
