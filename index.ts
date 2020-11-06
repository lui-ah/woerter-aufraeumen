import { BehaviorSubject, of, Subject } from "rxjs";
import { map, pairwise, startWith, take } from "rxjs/operators";
import "./style.css";

import { raetsel1, raetsel2 } from "./raetsel";

let output = new Subject();

let outputDiv = document.getElementById("output");

const contructHTML = neu => {
  return "<p>" + neu + "</p> <br/>";
};

// const removeDoubleMatches = (matches: Match[], availableArr: string[]) => {
//   if (!matches.some(match => !match.isArray())) return matches;
//   matches.forEach(match => {
//     return match.toSingleWord();
//   });

//   let stillAvailable = matches
//     .filter(match => !match.isArray())
//     .map(e => e.givenArr)
//     .flat();
//   console.log(stillAvailable);
// };

interface Given {
  atIndex: number;
  char: string;
}

const allEqualAndValid = arr => {
  return arr[0] && arr.length > 1 && arr.every(v => v === arr[0]);
};

class Lueken {
  luekenArr: Lueke[];
  private availableArr: string[];
  constructor(luekenArr: Lueke[], availableArr: string[]) {
    this.luekenArr = luekenArr;
    this.availableArr = availableArr;
  }
  private allToPerfectMatch() {
    this.luekenArr.forEach(e => e.toPerfectMatch(this.availableArr));
    this.luekenArr.forEach(match => {
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
    return this.luekenArr.some(e => typeof e.value != "string");
  }

  computeLueken() {
    while (this.someNull) {
      this.allToPerfectMatch();
    }
    return this;
  }
  get valueArray() {
    return this.luekenArr.map(e => e.value);
  }
  get valueString() {
    return this.valueArray.join(" ");
  }
}

class Lueke {
  lueke: string;
  givenArr: Given[];
  value: string;
  index: number;
  constructor(lueke: string, index: number) {
    this.lueke = lueke;
    this.index = index;
    this.givenArr = this.lueke
      .split("")
      .map((char, index) => ({
        atIndex: index,
        char
      }))
      .filter(char => char.char != "_");
  }

  private matchingwordsFromGiven(given: string[]): string[] {
    return given.filter(wort => {
      let sameLen = wort.length == this.lueke.length;
      let couldMatch =
        this.givenArr.length == 0 ||
        this.givenArr.some(given => wort[given.atIndex] == given.char);
      return sameLen && couldMatch;
    });
  }
  toPerfectMatch(given: string[]) {
    let fromGiven = this.matchingwordsFromGiven(given);
    if (fromGiven.length == 1 || allEqualAndValid(fromGiven)) {
      this.value = fromGiven[0];
      this;
    }
  }
}

function getAllAccurancesof(array, search) {
  return array.reduce(function(a, e, i) {
    if (e === search) a.push(i);
    return a;
  }, []);
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
  const LUEKENTEXT = DATA[0];
  const WOERTER = DATA[1];

  let LArray = LUEKENTEXT.replace(/\W+/g, " ").split(" ");

  LArray.pop();
  console.log(LArray);
  let WArray = WOERTER.split(" ");

  let availableArr = [...WArray];

  let matches = LArray.map((l, index) => {
    return new Lueke(l, index);
  });

  let lueken = new Lueken(matches, availableArr);
  output.next(lueken.computeLueken().valueString);
};

app(raetsel2);
