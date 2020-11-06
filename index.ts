import { BehaviorSubject, of, Subject } from "rxjs";
import { map, pairwise, startWith, take } from "rxjs/operators";
import "./style.css";

import { raetsel1, raetsel2 } from "./raetsel";

let output = new Subject();

let outputDiv = document.getElementById("output");

const contructHTML = neu => {
  return "<p>" + neu + "</p> <br/>";
};

interface Given {
  atIndex: number;
  char: string;
}

class Luecken {
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
    return this.lueckenArr.map(e => e.value);
  }
  get valueString() {
    return this.valueArray.join(" ");
  }
}

interface Punctiotion {
  atIndex: number[];
  char: string;
}

class Luecke {
  luecke: string;
  givenArr: Given[];
  value: string;
  index: number;
  punctuation: Punctiotion[] = [];
  constructor(luecke: string, index: number) {
    let period = this.getAllAccurancesof([...luecke], ".");
    this.punctuation.push(period);
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
  // get valueWithPunction() {

  // }
  private allEqualAndValid = arr => {
    return arr[0] && arr.length > 1 && arr.every(v => v === arr[0]);
  };
}

const app = (raetsel: string) => {
  output
    .pipe(
      startWith(""),
      pairwise(),
      take(100)
    )
    .subscribe(next => {
      let [alt, neu] = next;
      outputDiv.innerHTML = contructHTML(alt) + contructHTML(neu);
    });
  const DATA = raetsel.split("\n");
  const LUECKENTEXT = DATA[0];
  const WOERTER = DATA[1];

  let LArray = LUECKENTEXT.split(" ");
  let WArray = WOERTER.split(" ");

  let matches = LArray.map((l, index) => {
    return new Luecke(l, index);
  });

  let luecken = new Luecken(matches, WArray);
  output.next(luecken.computeLuecken().valueString);
};

app(raetsel2);
