import { Given, Punctiotion } from "./lib";

export class Luecken {
  lueckenArr: Luecke[];
  private availableArr: string[];
  constructor(lueckenArr: Luecke[], availableArr: string[]) {
    this.lueckenArr = lueckenArr;
    this.availableArr = availableArr;
  }
  private allToPerfectMatch() {
    this.lueckenArr.forEach(e => e.toPerfectMatch(this.availableArr));
    this.lueckenArr.forEach(match => {
      let value = match.value;
      if (value) {
        const index = this.availableArr.indexOf(value);
        if (index > -1) {
          this.availableArr.splice(index, 1);
        }
      }
    });
    return this;
  }
  private get someNull() {
    return this.lueckenArr.some(e => typeof e.value != "string");
  }

  computeLuecken() {
    while (this.someNull) {
      this.allToPerfectMatch();
    }
    return this;
  }
  get valueArray() {
    return this.lueckenArr.map(e => e.valueWithPunction);
  }
  get valueString() {
    return this.valueArray.join(" ");
  }
}

export class Luecke {
  luecke: string;
  givenArr: Given[];
  value: string;
  index: number;
  punctuation: Punctiotion[] = [];
  constructor(luecke: string, index: number) {
    let onlyPunct = [...luecke.slice(0).replace(/[^.^,^!^?^\\-]/g, "")];
    if (onlyPunct[0]) {
      onlyPunct = [...new Set(onlyPunct)];
      onlyPunct.forEach(typePresent => {
        let period = this.getAllAccurancesof([...luecke], typePresent);
        this.punctuation.push({
          atIndex: period,
          char: typePresent
        });
      });
    }
    this.luecke = luecke.replace(/\W+/g, "");

    this.index = index;
    this.givenArr = this.luecke
      .split("")
      .map((char, index) => ({
        atIndex: index,
        char
      }))
      .filter(char => char.char != "_");
  }

  private matchingwordsFromGiven(given: string[]): string[] {
    return given.filter(wort => {
      let sameLen = wort.length == this.luecke.length;
      let couldMatch =
        this.givenArr.length == 0 ||
        this.givenArr.some(given => wort[given.atIndex] == given.char);
      return sameLen && couldMatch;
    });
  }

  private getAllAccurancesof(array, search) {
    return array.reduce(function(a, e, i) {
      if (e === search) a.push(i);
      return a;
    }, []);
  }

  toPerfectMatch(given: string[]) {
    let fromGiven = this.matchingwordsFromGiven(given);
    if (fromGiven.length == 1 || this.allEqualAndValid(fromGiven)) {
      this.value = fromGiven[0];
      this;
    }
  }
  get valueWithPunction() {
    let test = this.value;
    if (!test || !((this.punctuation[0] || {}).atIndex || [undefined])[0])
      return test;
    this.punctuation.forEach(kind => {
      let type = kind.char;
      if (!type) return test;
      kind.atIndex.forEach((atPlace, index) => {
        test = test.substring(0, atPlace) + type + test.substring(atPlace);
      });
    });
    return test;
  }
  private allEqualAndValid = arr => {
    return arr[0] && arr.length > 1 && arr.every(v => v === arr[0]);
  };
}
