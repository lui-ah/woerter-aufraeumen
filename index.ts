import { BehaviorSubject, of, Subject } from "rxjs";
import { map, pairwise, startWith, take } from "rxjs/operators";
import "./style.css";

import { raetsel1, raetsel2, raetsel4 } from "./raetsel";
import { Luecke, Luecken } from "./class";

let output = new Subject();

let outputDiv = document.getElementById("output");

const contructHTML = neu => {
  return "<p>" + neu + "</p> <br/>";
};

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

app(raetsel4);
