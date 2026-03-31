import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const interestsList = [
  "Технологии", "Искусственный интеллект", "Нейросети", "ИИ-инструменты",
  "Data Science", "Машинное обучение", "Кибербезопасность", "Web",
  "Frontend", "Backend", "Fullstack", "UX/UI дизайн", "Мобильные приложения",
  "Геймдев", "AR/VR", "3D-графика", "DevOps", "Linux", "GitHub", "Open Source",
  "Автоматизация", "Системное администрирование", "Олимпиадное программирование",
  "Алгоритмы", "Базы данных", "Облачные технологии", "Криптовалюта", "Блокчейн",
  "Фреймворки", "API", "Архитектура ПО", "Тестирование", "Low-code / No-code",
  "Продакт-менеджмент", "Стартапы", "IoT", "Робототехника", "Математика",
  "Аналитика данных", "Компьютерное зрение", "Квантовые вычисления",
  "Образование и курсы", "Хакатоны", "IT-сообщества", "Фриланс", "Карьера в IT", "Другое"
];

const borderColors = [
  "#ff5f5f", "#ffae42", "#ffea00", "#7ed957", "#5ce1e6",
  "#38b6ff", "#5b5bff", "#b15fff", "#ff66c4", "#ff914d"
];

const Moda = ({ onClose }) => {
  const [page, setPage] = useState(1);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const scrollRef = useRef(null);

  const [shouldShow, setShouldShow] = useState(() => {
    return !localStorage.getItem("atomglideBetaAccepted");
  });

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el) {
      const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      setIsScrolledToBottom(isBottom);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el && page === 1) {
      el.addEventListener("scroll", handleScroll);
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [page]);

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      } else if (prev.length < 5) {
        return [...prev, interest];
      } else {
        return prev;
      }
    });
  };

  const handleFinish = () => {
    localStorage.setItem("atomglideBetaAccepted", "true");

    localStorage.setItem(
      "atomglideUserData",
      JSON.stringify({ birthDate, email, interests: selectedInterests })
    );

    onClose?.();
    setShouldShow(false);
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.96, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.96, y: -10, transition: { duration: 0.25, ease: "easeIn" } },
  };

  if (!shouldShow) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <AnimatePresence mode="wait">
          {page === 1 && (
            <motion.div key="page1" {...pageVariants}>
              <center><img src="1.png" className="log-mod" alt="logo" /></center>
              <h2 className="title-mod" style={{color:'white'}}>AtomGlide 12 Pumpkin</h2>
              <div className="win-mod" ref={scrollRef}>
<p className="win-mod-text">
  <strong>ДОБРО ПОЖАЛОВАТЬ В ATOMGLIDE.COM</strong><br /><br />
  Добро пожаловать в сообщество <strong>AtomGlide</strong>! Перед началом использования платформы, пожалуйста, внимательно ознакомьтесь с основными положениями и правилами сообщества. 
  Продолжая использование сайта и сервисов, вы подтверждаете своё согласие с <a href="https://atomglide.com/atomwiki.html" target="_blank"><strong>Правилами сообщества AtomGlide</strong></a>.<br /><br />

  <strong>1. ОБЩИЕ ПОЛОЖЕНИЯ</strong><br />
  1.1. AtomGlide — это платформа для общения, обмена информацией и участия в проектах сообщества.<br />
  1.2. Используя наши сервисы, вы подтверждаете, что ознакомлены и согласны с правилами и политикой использования.<br /><br />

  <strong>2. НОВАЯ ВЕРСИЯ ATOMGLIDE</strong><br />
  2.1. Данная версия AtomGlide включает обновлённую систему телеметрии.<br />
  2.2. В процессе использования могут собираться следующие данные: адрес электронной почты, дата рождения, ваши интересы и технические параметры устройства.<br />
  2.3. Все собранные данные <strong>являются строго конфиденциальными</strong>, не передаются третьим лицам и <strong>надежно шифруются</strong> на серверах AtomGlide.<br /><br />

  <strong>3. НОВЫЕ ЧАТЫ И ШИФРОВАНИЕ</strong><br />
  3.1. В новой версии введена обновлённая система чатов.<br />
  3.2. Все сообщения пользователей защищены с помощью алгоритма <strong>AES (Advanced Encryption Standard)</strong> — современного протокола симметричного шифрования, применяемого для защиты данных на уровне банковских и государственных систем.<br />
  3.3. Это означает, что каждое сообщение шифруется на устройстве отправителя и расшифровывается только у получателя, обеспечивая полную приватность переписки.<br /><br />

  <strong>4. ОТВЕТСТВЕННОСТЬ И ПРАВА АДМИНИСТРАЦИИ</strong><br />
  4.1. Администрация AtomGlide не несёт ответственности за содержание сообщений, отправляемых пользователями. Платформа выступает как технический провайдер связи.<br />
  4.2. Однако, в случае нарушения <a href="https://atomglide.com/atomwiki.html" target="_blank">правил сообщества</a>, администрация оставляет за собой право:<br />
  — временно или навсегда ограничить доступ пользователя к сервисам;<br />
  — проверить содержимое сообщений в рамках расследования нарушений;<br />
  — принять иные меры в соответствии с действующими правилами и законодательством.<br /><br />

  <strong>5. ЗАПРЕЩЁННЫЙ КОНТЕНТ</strong><br />
  Обращаем ваше внимание, что любые проявления <strong>экстремизма</strong>, продажа <strong>запрещённых веществ</strong>, а также предложения <strong>интимных услуг</strong> строго запрещены и влекут немедленную блокировку аккаунта без права восстановления.<br /><br />

  <strong>6. ПОДТВЕРЖДЕНИЕ СОГЛАСИЯ</strong><br />
  Нажимая на кнопку <strong>«Продолжить»</strong>, вы подтверждаете, что ознакомлены и полностью согласны с настоящими условиями и <a href="https://atomglide.com/atomwiki.html" target="_blank">правилами сообщества AtomGlide</a>.<br /><br />
</p>
              </div>
              <center>
                <button
                  onClick={() => setPage(2)}
                  className="bth-mod"
                  disabled={!isScrolledToBottom}
                >
                  Продолжить
                </button>
                {!isScrolledToBottom && (
                  <p className="scroll-hint">Дочитайте до конца, чтобы продолжить</p>
                )}
              </center>
            </motion.div>
          )}

          {page === 2 && (
            <motion.div key="page2" {...pageVariants}>
              <h2 className="title-mod" style={{color:'white'}}>Введите дату рождения 🎂</h2>
              <p style={{ textAlign: "center", color: "#bbb", marginBottom: "15px" }}>
                Это поможет нам подбирать контент, подходящий вашему возрасту.
              </p>
              <center>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="input-mod"
                  style={{
                    borderRadius: "10px",
                    padding: "8px",
                    background: "#2a2a2a",
                    color: "white",
                    border: "1px solid #555",
                  }}
                />
                <br />
                <button
                  onClick={() => setPage(3)}
                  className="bth-mod"
                  disabled={!birthDate}
                >
                  Далее
                </button>
              </center>
            </motion.div>
          )}

          {page === 3 && (
            <motion.div key="page3" {...pageVariants}>
              <h2 className="title-mod" style={{color:'white'}}>Введите ваш Email 📧</h2>
              <p style={{ textAlign: "center", color: "#bbb", marginBottom: "15px" }}>
                Мы используем почту только для подтверждения и уведомлений о важных событиях.
              </p>
              <center>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-mod"
                  placeholder="you@example.com"
                  style={{
                    borderRadius: "10px",
                    padding: "8px",
                    background: "#2a2a2a",
                    color: "white",
                    border: "1px solid #555",
                  }}
                />
                <br />
                <button
                  onClick={() => setPage(4)}
                  className="bth-mod"
                  disabled={!email}
                >
                  Далее
                </button>
              </center>
            </motion.div>
          )}

          {page === 4 && (
            <motion.div key="page4" {...pageVariants}>
              <h2 className="title-mod" style={{color:'white'}}>Выберите ваши интересы 🎯</h2>
              <p style={{ textAlign: "center", color: "#bbb", marginBottom: "15px", marginTop: "-20px" }}>
                Можно выбрать до 5 интересов.
              </p>

              <div
                className="bubble-container"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "8px",
                  maxHeight: "375px",
                  overflowY: "auto",
                  padding: "10px 6px",
                  width: "100%",
                  position: "relative",
                  boxShadow:
                    "inset 0 20px 20px -20px rgba(0, 0, 0, 0.6), inset 0 -20px 20px -20px rgba(0, 0, 0, 0.6)",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#555 transparent",
                }}
              >
                {interestsList.map((interest, index) => {
                  const isSelected = selectedInterests.includes(interest);
                  const color = borderColors[index % borderColors.length];
                  return (
                    <div
                      key={interest}
                      className="bubble"
                      onClick={() => toggleInterest(interest)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "50px",
                        border: `2px solid ${color}`,
                        cursor: "pointer",
                        background: isSelected ? color : "transparent",
                        color: isSelected ? "#000" : "#ddd",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                        userSelect: "none",
                      }}
                    >
                      {interest}
                    </div>
                  );
                })}
              </div>

              <center>
                <button onClick={handleFinish} className="bth-mod">
                  Завершить
                </button>
              </center>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Moda;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
