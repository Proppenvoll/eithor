import { useEffect, useMemo, useState } from "react";
import {
  getQuestion,
  postAnswer,
  startOver,
  type Answer,
  type Question,
  type Result,
} from "./question-service";
import Button from "./components/button";
import { ReactLogo } from "./assets/react-logo";
import { SpringLogo } from "./assets/spring-logo";

function assertNever(value: never): never {
  throw new Error(`never assertion faild for value: ${value}`);
}

type QuestionKeys = keyof Result["question"];

function ResultBarPart({
  result,
  eitherOrOr,
}: {
  result: Result;
  eitherOrOr: QuestionKeys;
}) {
  const distributionOutcome: "winner" | "loser" | "tie" = useMemo(() => {
    const otherSelectionKey: QuestionKeys =
      eitherOrOr === "either" ? "or" : "either";
    const myDistriburtionValue = result.distribution[eitherOrOr];
    const otherDistributionValue = result.distribution[otherSelectionKey];
    if (myDistriburtionValue > otherDistributionValue) {
      return "winner";
    }
    if (myDistriburtionValue === otherDistributionValue) {
      return "tie";
    }
    return "loser";
  }, [eitherOrOr, result.distribution]);

  const isMajoritySelection = "";

  const growAndShrinkStyle =
    eitherOrOr === "either"
      ? {
          flexGrow: result.distribution.either,
          flexShrink: result.distribution.or,
        }
      : {
          flexGrow: result.distribution.or,
          flexShrink: result.distribution.either,
        };

  const isMajority = result.distribution.either > result.distribution.or;
  // const barClass =

  const emoji = useMemo(() => {
    switch (distributionOutcome) {
      case "winner":
      case "tie":
        return "😌";
      case "loser":
        return "🙄";
      default:
        assertNever(distributionOutcome);
    }
  }, [distributionOutcome]);

  function getBackgroundClass() {
    switch (distributionOutcome) {
      case "winner":
        return "bg-green-500";
      case "tie":
        return "bg-yellow-500";
      case "loser":
        return "bg-red-500";
      default:
        assertNever(distributionOutcome);
    }
  }

  function theCla() {
    const roundingClass = eitherOrOr === "either" ? "rounded-l" : "rounded-r";
    const background = getBackgroundClass();
    return roundingClass + " " + background + " " + " p-2";
  }

  function content() {
    return eitherOrOr === "either"
      ? `${result.question.either} (${result.distribution.either})`
      : `${result.question.or} (${result.distribution.or})`;
  }

  function isYourSelection() {
    console.log(result);
    return result.answer === result.question[eitherOrOr];
  }

  return (
    <div className="size-full text-center min-w-fit" style={growAndShrinkStyle}>
      <div className={theCla()}>{content()}</div>
      {isYourSelection() && (
        <div className="mt-2">
          <div>⬆️</div>
          <div>You {emoji}</div>
        </div>
      )}
    </div>
  );
}

function ResultBar({ result }: { result: Result }) {
  return (
    <div className="w-full mt-4 flex overflow-hidden">
      <ResultBarPart result={result} eitherOrOr="either"></ResultBarPart>
      <ResultBarPart result={result} eitherOrOr="or"></ResultBarPart>
    </div>
  );
}
// function ResultBar({ result }: { result: Result }) {
//   return (
//     <div className="w-full mt-4 flex overflow-hidden">
//       <div
//         className="size-full text-center min-w-fit"
//         style={{
//           flexGrow: result.distribution.either,
//           flexShrink: result.distribution.or,
//         }}
//       >
//         <div
//           className={
//             result.distribution.either > result.distribution.or
//               ? "bg-green-500 rounded-l p-2"
//               : "bg-red-500 rounded-l p-2"
//           }
//         >
//           {result.question.either} ({result.distribution.either})
//         </div>
//         {result.answer === result.question.either && (
//           <div className="mt-2">
//             <div>⬆️</div>
//             <div className="">
//               You{" "}
//               {result.distribution.either > result.distribution.or
//                 ? "😌"
//                 : "🙄"}
//             </div>
//           </div>
//         )}
//       </div>

//       <ResultBarPart result={result} eitherOrOr="either"></ResultBarPart>
//       <ResultBarPart result={result} eitherOrOr="or"></ResultBarPart>
//       <div
//         className="size-full text-center min-w-fit"
//         style={{
//           flexGrow: result.distribution.or,
//           flexShrink: result.distribution.either,
//         }}
//       >
//         <div
//           className={
//             result.distribution.or > result.distribution.either
//               ? "bg-green-500"
//               : "bg-red-500"
//           }
//         >
//           {result.question.or} ({result.distribution.or})
//         </div>
//         {result.answer === result.question.or && (
//           <div className="mt-1">
//             <div>⬆️</div>
//             <div className="">
//               You{" "}
//               {result.distribution.or > result.distribution.either
//                 ? "😌"
//                 : "🙄"}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

function App() {
  const [question, setQuestion] = useState<Question>();
  const [result, setResult] = useState<Result>();
  const [activeView, setActiveView] = useState<"question" | "answer">(
    "question",
  );

  async function fetchQuestion() {
    const fetchedQuestion = await getQuestion();
    setQuestion(fetchedQuestion ?? undefined);
    setActiveView("question");
  }

  async function submitAnswer(answer: Answer) {
    const result = await postAnswer(answer);
    setResult(result);
    setActiveView("answer");
  }

  async function restart() {
    const question = await startOver();
    setQuestion(question);
  }

  useEffect(() => {
    fetchQuestion();
  }, []);

  return (
    <main className="flex-1 p-4 bg-gray-700 text-white flex flex-col">
      <h1 className="text-4xl text-center font-bold">Eithor</h1>
      <div className="mt-8 opacity-40 max-w-prose mx-auto">
        <p className="text-sm">
          Choose your favorite and see if you are in the majority of if the
          other ones are strange.
        </p>
        <p className="text-xs mt-1">
          Note that this is just a demo application. The presented data is
          randomized and resetted every day.
        </p>
      </div>

      <div className="my-auto">
        {activeView === "question" && (
          <>
            {question ? (
              <div className="mt-10 flex flex-col gap-2 items-center">
                <Button
                  onClick={() =>
                    submitAnswer({
                      answer: question.either,
                      questionId: question.questionId,
                    })
                  }
                >
                  {question.either}
                </Button>
                <div className="font-bold opacity-40 italic">vs</div>
                <Button
                  onClick={() =>
                    submitAnswer({
                      answer: question.or,
                      questionId: question.questionId,
                    })
                  }
                >
                  {question.or}
                </Button>
              </div>
            ) : (
              <div>
                <div>
                  It look's like you have completed all Questions 🎉! Thank you
                  for participating!
                </div>
                <Button onClick={restart} className="mt-4">
                  Start over
                </Button>
              </div>
            )}
          </>
        )}

        {activeView === "answer" && (
          <>
            <div className="mt-10">
              {result && <ResultBar result={result}></ResultBar>}
            </div>
            <Button className="mt-4" onClick={fetchQuestion}>
              Next
            </Button>
          </>
        )}
      </div>

      <div className="mt-auto flex flex-col items-center text-sm gap-2 opacity-70">
        <a
          href="https://github.com/Proppenvoll/eithor"
          className="border border-gray-900 p-2 rounded hover:bg-gray-900 cursor-pointer"
        >
          Show me the code!
        </a>

        <div className="*:hover:underline *:inline-flex *:gap-1">
          Powered by{" "}
          <a href="https://react.dev/">
            React <ReactLogo className="size-5"></ReactLogo>
          </a>{" "}
          &{" "}
          <a href="https://spring.io/">
            Spring <SpringLogo className="size-5"></SpringLogo>
          </a>
        </div>
      </div>
    </main>
  );
}

export default App;
