export class VisualizationTools {
	public static getRandomHexColor(): string {
		let rndColor = Math.floor(Math.random() * 16777215).toString(16);
		return this._fillHexColorZeros(rndColor);
	}

	public static guidGenerator(): string {
			let S4 = function() {
				return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			};
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
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
