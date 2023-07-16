import {createContext, useState} from 'react';

export const SpeakContext = createContext(null);

const ScrapalotSpeechSynthesis = ({children}) => {
    const [speaking, setSpeaking] = useState(false);

    const speak = (text, lang = 'en-US') => {
        if (speaking) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }

        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        let i = 0;

        const speakSentence = () => {
            if (i < sentences.length) {
                const utterThis = new SpeechSynthesisUtterance(sentences[i]);
                utterThis.lang = lang;
                utterThis.onend = function (event) {
                    window.speechSynthesis.cancel();
                    i++;
                    speakSentence();
                }
                utterThis.onerror = function (event) {
                    console.error('SpeechSynthesisUtterance.onerror');
                }

                if (window.speechSynthesis.getVoices().length === 0) {
                    window.speechSynthesis.onvoiceschanged = function () {
                        window.speechSynthesis.speak(utterThis);
                    };
                } else {
                    window.speechSynthesis.speak(utterThis);
                }

                setSpeaking(true);
            } else {
                setSpeaking(false);
            }
        };

        speakSentence();

        // Add a check to see if the speech synthesis is still speaking after a delay
        setTimeout(() => {
            if (!window.speechSynthesis.speaking && speaking) {
                speakSentence();
            }
        }, 5000); // Adjust the delay as needed
    };

    return (
        <SpeakContext.Provider value={{speak}}>
            {children}
        </SpeakContext.Provider>
    );
};

export default ScrapalotSpeechSynthesis;
