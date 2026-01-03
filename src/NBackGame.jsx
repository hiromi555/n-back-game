import { useState, useEffect, useRef } from 'react'
import { Text, Html } from '@react-three/drei'
import confetti from 'canvas-confetti';

export function NBackGame({
  defaultN = 1,
  defaultTotal = 10,
  defaultInterval = 5000
}) {
  const historyRef = useRef([]);
  const [status, setStatus] = useState("setting");
  const [n, setN] = useState(defaultN);
  const [total, setTotal] = useState(defaultTotal);

  // 速度管理のための2つのState
  const [selectedSpeed, setSelectedSpeed] = useState(defaultInterval); // ユーザーの希望速度（基本）
  const [intervalTime, setIntervalTime] = useState(defaultInterval);   // 実際に動くタイマー速度（変化する）

  const [currentNumber, setCurrentNumber] = useState(null);
  const [history, setHistory] = useState([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [count, setCount] = useState(0);
  const [score, setScore] = useState(0);
  const [style, setStyle] = useState({ color: "white", scale: 1 });
  const [showResultButton, setShowResultButton] = useState(false);

  const displayCount = history.length - n;

  // 設定画面で速度を変える関数
  const changeSpeed = (speed) => {
    setSelectedSpeed(speed); // 希望速度を保存
    setIntervalTime(speed);  // タイマーにもセット
  };

  // --- ロジック関数 ---
  const checkAnswer = (userChoice) => {
    if (history.length <= n || hasAnswered) return;

    const nBackNumber = history[0];
    const currentNum = history[history.length - 1];
    const isMatch = nBackNumber === currentNum;

    if (userChoice === isMatch) {
      setFeedback("⭕️ 正解！");
      setScore(prev => prev + 1);
    } else {
      setFeedback("❌ 残念！");
    }
    setHasAnswered(true);

    // 回答したら、一時的に「2秒」に加速！
    setIntervalTime(2000);
  };

  const startGame = () => {
    setHistory([]);
    historyRef.current = [];
    setCurrentNumber(null);
    setCount(0);
    setScore(0);
    setHasAnswered(false);
    setFeedback("");
    setStatus("playing");
    setStyle({ color: "white", scale: 1 });
    // ゲーム開始時は必ず「ユーザーの希望速度」に戻す
    setIntervalTime(selectedSpeed);
  };

  const triggerEffect = () => {
    setStyle({ color: "black", scale: 1.2 });
    setTimeout(() => setStyle({ color: "white", scale: 1 }), 300);
  };

  // 共通のボタンスタイル
  const buttonStyle = (color) => ({
    fontSize: 'clamp(1rem, 4vw, 1.5rem)',
    padding: '20px 0',
    width: '130px',
    borderRadius: '50px',
    border: '3px solid white',
    backgroundColor: color,
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 5px 0 rgba(0,0,0,0.5)',
    outline: 'none',
    transition: 'transform 0.1s',
  });

  // 設定画面のボタン
  const toggleStyle = (active) => ({
    padding: '8px 12px',
    margin: '4px',
    fontSize: '1rem',
    backgroundColor: active ? '#FFD700' : 'rgba(255,255,255,0.1)',
    color: active ? 'black' : 'white',
    border: active ? '2px solid white' : '1px solid #555',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    minWidth: '60px'
  });

  // --- ゲームループ ---
  useEffect(() => {
    if (status !== "playing") return;

    const timer = setInterval(() => {
      const currentHistory = historyRef.current;
      let nextNum;
      const targetNum = currentHistory.length >= n ? currentHistory[currentHistory.length - n] : null;

      const isMatchTurn = Math.random() < 0.4 && targetNum !== null;

      if (isMatchTurn) {
        nextNum = targetNum;
      } else {
        do {
          nextNum = Math.floor(Math.random() * 5) + 1;
        } while (nextNum === targetNum);
      }

      setHistory(prev => {
        const newHistory = [...prev, nextNum];
        if (newHistory.length > n + 1) newHistory.shift();
        historyRef.current = newHistory;
        return newHistory;
      });

      setCurrentNumber(nextNum);

      //数字が出たら、速度をチェックして元に戻す
      setIntervalTime(prev => {
        // つまり2秒になっていたら、元に戻す
        if (prev !== selectedSpeed) {
            return selectedSpeed;
        }
        return prev;
      });

      triggerEffect();
      setHasAnswered(false);
      setFeedback(`${n}つ前とおなじ？`);

      setCount(prev => {
        const nextCount = prev + 1;
        if (nextCount > total + n) {
          setStatus("gameover");
          clearInterval(timer);
        }
        return nextCount;
      });
    }, intervalTime); // 実際の速度（intervalTime）が変わるたびにタイマー再セット

    return () => clearInterval(timer);
  }, [status, n, total, intervalTime, feedback, selectedSpeed]);

  //戻るボタン（安全装置）
  useEffect(() => {
    if (status === "gameover") {
      setShowResultButton(false);
      const timer = setTimeout(() => {
        setShowResultButton(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // --- クラッカー発射用 ---
  useEffect(() => {
    if (status === "gameover" && score === total) {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#FFD700', '#FF00FF'],
      });
      setTimeout(() => {
        confetti({
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#00ff00', '#FF4500'],
          });
      }, 200);
    }
  }, [status, score, total]);

  // --- 画面描画 ---

  // 1. 設定画面
  if (status === "setting") {
    return (
      <Html center>
        <div style={{
          background: 'rgba(20, 20, 30, 0.95)',
          padding: '20px',
          borderRadius: '20px',
          color: 'white',
          textAlign: 'center',
          width: '85vw',
          maxWidth: '400px',
          border: '3px solid #FFD700',
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
        }}>
          <h2 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>🧠 脳トレ設定</h2>

          <div style={{ marginBottom: '15px' }}>
            <p style={{opacity: 0.8, fontSize: '0.8rem', margin: '5px'}}>何個前をおぼえる？</p>
            {[1, 2, 3].map(v => (
              <button key={v} onClick={() => setN(v)} style={toggleStyle(n === v)}>{v}つ</button>
            ))}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p style={{opacity: 0.8, fontSize: '0.8rem', margin: '5px'}}>問題数</p>
            {[5, 10, 15].map(v => (
              <button key={v} onClick={() => setTotal(v)} style={toggleStyle(total === v)}>{v}問</button>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{opacity: 0.8, fontSize: '0.8rem', margin: '5px'}}>速さ</p>
            {[2, 3, 5, 8].map(v => (
              <button key={v} onClick={() => changeSpeed(v * 1000)} style={toggleStyle(selectedSpeed === v * 1000)}>{v}秒</button>
            ))}
          </div>

          <button style={{...buttonStyle('#2ecc71'), width: '80%'}} onClick={startGame}>スタート！</button>
        </div>
      </Html>
    );
  }

  // 2. ゲーム終了画面
  if (status === "gameover") {
    return (
      <group>
        <Text
          position={[0, 2, 0]}
          fontSize={0.35}
          color={score === total ? "#FFD700" : "white"}
          outlineWidth={0.02}
          outlineColor="black"
        >
          {score === total ? "全問正解✨" : "  おつかれさま🍵"}
        </Text>

        <Text
          position={[0, 0.8, 0]}
          fontSize={0.5}
          color={score === total ? "#FFFACD" : "#4FC3F7"}
          outlineWidth={0.05}
          outlineColor="black"
        >
          {score} / {total} 問
        </Text>

        <Html position={[0, -1.5, 0]} center>
          {showResultButton && (
            <button
              style={{...buttonStyle('#3498db'), width: '200px'}}
              onClick={() => setStatus("setting")}
            >
              設定にもどる
            </button>
          )}
        </Html>
      </group>
    );
  }

  // 3. プレイ画面
  return (
    <group>
      <Text position={[0, 2.5, 0]} fontSize={0.2} color="#ccc">
        {displayCount <= 0 ? "数字をおぼえてね！" : `第 ${count - n} 問 / ${total}`}
      </Text>

      {/* メインの数字 */}
      <Text
        color={style.color}
        position={[0, 0, 0]}
        fontSize={2.5}
        font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxM.woff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="black"
      >
        {currentNumber}
      </Text>

      {displayCount > 0 && (
        <group>
          {/* 問いかけメッセージ */}
          <Text
            position={[0, 1.8, 0]}
            fontSize={0.25}
            color={style.color}
          >
             {feedback.includes("正解") || feedback.includes("残念") ? "" : feedback}
          </Text>

          {/* 判定結果（大きく表示） */}
          {(feedback.includes("正解") || feedback.includes("残念")) && (
             <Text
               position={[0, 0, 0]}
               fontSize={0.45}
               color={feedback.includes("正解") ? "#2ecc71" : "#e85f4f"}
               outlineWidth={0.05}
               outlineColor="white"
             >
               {feedback}
             </Text>
          )}

          {/* ボタン配置 */}
          <Html position={[0, -2, 0]} center>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', width: '90vw' }}>
              <button style={buttonStyle('#2ecc71')} onClick={() => checkAnswer(true)}>⭕️ おなじ</button>
              <button style={buttonStyle('#e85f4f')} onClick={() => checkAnswer(false)}>❌ ちがう</button>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
