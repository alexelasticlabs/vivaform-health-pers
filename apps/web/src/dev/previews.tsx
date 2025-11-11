import {ComponentPreview, Previews} from "@react-buddy/ide-toolbox";
import {PaletteTree} from "./palette";
import {QuizPage} from "../pages/quiz-page";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/QuizPage">
                <QuizPage/>
            </ComponentPreview>
        </Previews>
    );
};

export default ComponentPreviews;