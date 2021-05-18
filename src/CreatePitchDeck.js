import React, { useState, useEffect } from "react";
import axios from "axios";
import PitchDeckData from "./PitchDeckData.json";
import { motion } from "framer-motion";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Tooltip from "@material-ui/core/Tooltip";

const pitchDeckPreviewVariants = {
  open: {
    opacity: 1,
    x: "0",
    transition: {
      duration: 0.5,
      type: "spring",
    },
  },
  hidden: {
    opacity: 0.6,
    x: "-20%",
  },
};

const CreatePitchDeck = () => {
  const [currentSlideNo, setCurrentSlideNo] = useState(1);
  const [slideInputData, setSlideInputData] = useState([]);
  const [isNextSlideLoading, setIsNextSlideLoading] = useState(false);
  const [templateData, setTemplateData] = useState({});
  const [userInputTemplateData, setUserInputTemplateData] = useState(null);

  useEffect(() => {
    // GET DATA FROM TEMPLATE ie. JSON/API
    setTemplateData(PitchDeckData);

    const userID = "NEW";
    const templateId = "123456789";
    const slideNo = currentSlideNo;

    axios({
      method: "get",
      url: `${process.env.REACT_APP_API_URL}/pitchdeck/${userID}/${templateId}/${slideNo}`,
    })
      .then((res) => {
        const { response } = res.data;

        if (response) {
          const { inputFieldsData } = response;
          setSlideInputData(inputFieldsData);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleTemplateDataUpdate = (nextSlideNo) => {
    const slideUpdatePayloadData = {
      userId: "NEW",
      templateId: "123456789",
      slideData: {
        slideNo: currentSlideNo,
        inputFieldsData: slideInputData,
        previewLabel: PitchDeckData.slidesData[currentSlideNo].contentData.previewLabel
      },
      nextSlideNo,
    };

    setIsNextSlideLoading(true);

    // TODO: LOCALSTORAGE
    // localStorage.setItem("pitch", JSON.stringify(slideUpdatePayloadData));

    axios({
      method: "post",
      url: `${process.env.REACT_APP_API_URL}/pitchdeck/`,
      data: {
        ...slideUpdatePayloadData,
      },
    })
      .then((res) => {
        const { response } = res.data;

        if (response) {
          const { inputFieldsData } = response;
          setSlideInputData(inputFieldsData);
          setIsNextSlideLoading(false);
        }

        return;
      })
      .catch((error) => {
        setIsNextSlideLoading(false);
      });
  };

  const onNextSlideClick = async () => {
    const nextSlideNo = currentSlideNo + 1;

    handleTemplateDataUpdate(nextSlideNo);

    // Go to next slide
    setCurrentSlideNo(nextSlideNo);
  };

  const onPreviousSlideClick = () => {
    const previousSlideNo = currentSlideNo - 1;
    handleTemplateDataUpdate(previousSlideNo);

    // Go to prev slide
    setCurrentSlideNo(previousSlideNo);
  };

  const handleFormInputField = (
    event,
    inputFieldKey,
    inputValue,
    inputType
  ) => {
    let inputFieldData = {
      inputFieldKey,
      inputValue,
      inputType,
    };
    // Get Base64 String from image file
    if (inputType === "FILE") {
      const file = event.target.files[0];

      const reader = new FileReader();

      reader.onloadend = function () {
        inputFieldData.inputValue = reader.result;

        storeInputData(inputFieldData);
      };

      reader.readAsDataURL(file);

      return;
    }

    storeInputData(inputFieldData);
  };

  const storeInputData = (inputFieldData) => {
    const { inputFieldKey } = inputFieldData;

    // Get the data from user using Keys in form in slides
    const isInputFieldKeyExists = slideInputData.find(
      (inputFieldData) => inputFieldData.inputFieldKey === inputFieldKey
    );

    // 1. If key exists => update data in existing array
    if (isInputFieldKeyExists) {
      const indexOfExistingInputField = slideInputData.findIndex(
        (inputFieldData) => inputFieldData.inputFieldKey === inputFieldKey
      );

      let slicedInputFieldData = slideInputData;
      slicedInputFieldData[indexOfExistingInputField] = inputFieldData;

      setSlideInputData(() => [...slicedInputFieldData]);
    }

    // 2. Else key doesn't exists => Push data to array
    else {
      setSlideInputData([...slideInputData, inputFieldData]);
    }
  };

  // On exporting template
  const onExportingTemplate = (event) => {
    event.preventDefault();

    const userID = "NEW";
    const templateId = "123456789";

    axios({
      method: "get",
      url: `${process.env.REACT_APP_API_URL}/pitchdeck/${userID}/${templateId}`,
    })
      .then((res) => {
        const { response } = res.data;

        console.log(response)

        if (response) {
          setUserInputTemplateData(response);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const { slidesData } = PitchDeckData;

  const templateSlides = slidesData;

  return (
    <main className="createpitchdeck">
      <section className="createpitchdeck__container">
        <div className="createpitchdeck__container__content">
          <Stepper
            activeStep={currentSlideNo - 1}
            orientation="horizontal"
            style={{ padding: "1rem 0" }}
          >
            {templateSlides.map((slideData, key) => {
              const { title } = slideData.contentData;
              return (
                <Step key={key}>
                  <StepLabel>{title}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {PitchDeckData.slidesData.map((slideData, key) => {
            const { slideNo, contentData, formData } = slideData;

            const isLastSlide =
              PitchDeckData.slidesData.length === currentSlideNo;

            return slideNo === currentSlideNo ? (
              <>
                <div
                  className="createpitchdeck__container__content__header"
                  key={key}
                >
                  <div className="createpitchdeck__container__content__header__content">
                    <h1 className="heading-main createpitchdeck__container__content__header__content__heading">
                      {contentData.heading}
                    </h1>
                    <p className="paragraph createpitchdeck__container__content__header__content__paragraph">
                      {contentData.paragraph}
                    </p>
                  </div>
                </div>

                <div className="createpitchdeck__container__content__main"  key={slideNo}>
                  <div className="createpitchdeck__container__content__main__container">
                    {!isNextSlideLoading ? (
                      <>
                        <TemplateSlidePreview
                          slideInputData={slideInputData}
                          contentData={contentData}
                        />
                        <motion.div
                          className="createpitchdeck__container__content__main__container__actions"
                          variants={pitchDeckPreviewVariants}
                          animate="open"
                          initial="hidden"
                        >
                          <form className="form createpitchdeck__container__content__main__container__actions__form">
                            {formData.inputFieldsData.map(
                              (inputFieldData, key) => {
                                let textAreaInputData;
                                let textInputData;

                                if (slideInputData.length > 0) {
                                  textAreaInputData = slideInputData.find(
                                    (slideData) =>
                                      slideData.inputType === "TEXTAREA"
                                  );
                                  textInputData = slideInputData.find(
                                    (slideData) =>
                                      slideData.inputType === "TEXT"
                                  );
                                }

                                if (inputFieldData.type === "TEXTAREA") {
                                  return (
                                    <div
                                      className="form__group createpitchdeck__container__content__main__container__actions__form__group"
                                      key={key}
                                    >
                                      <label className="form__label createpitchdeck__container__content__main__container__actions__form__label">
                                        {inputFieldData.label}

                                        <Tooltip
                                          title={<h5>{inputFieldData.tip}</h5>}
                                        >
                                          <h5>?</h5>
                                        </Tooltip>
                                      </label>
                                      <textarea
                                        type={inputFieldData.type}
                                        rows="5"
                                        className="form__input createpitchdeck__container__content__main__container__actions__form__input"
                                        value={
                                          textAreaInputData
                                            ? textAreaInputData.inputValue
                                            : ""
                                        }
                                        onChange={(event) =>
                                          handleFormInputField(
                                            event,
                                            inputFieldData.key,
                                            event.target.value,
                                            inputFieldData.type
                                          )
                                        }
                                      />
                                    </div>
                                  );
                                }

                                if (inputFieldData.type === "FILE") {
                                  return (
                                    <div
                                      className="form__group createpitchdeck__container__content__main__container__actions__form__group"
                                      key={key}
                                    >
                                      <label className="form__label createpitchdeck__container__content__main__container__actions__form__label">
                                        {inputFieldData.label}

                                        <Tooltip
                                          title={<h5>{inputFieldData.tip}</h5>}
                                        >
                                          <h5>?</h5>
                                        </Tooltip>
                                      </label>
                                      <input
                                        type={inputFieldData.type}
                                        className="form__input createpitchdeck__container__content__main__container__actions__form__input"
                                        onChange={(event) =>
                                          handleFormInputField(
                                            event,
                                            inputFieldData.key,
                                            event.target.value,
                                            inputFieldData.type
                                          )
                                        }
                                      />
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    className="form__group createpitchdeck__container__content__main__container__actions__form__group"
                                    key={key}
                                  >
                                    <label className="form__label createpitchdeck__container__content__main__container__actions__form__label">
                                      {inputFieldData.label}

                                      <Tooltip
                                        title={<h5>{inputFieldData.tip}</h5>}
                                      >
                                        <h5>?</h5>
                                      </Tooltip>
                                    </label>
                                    <input
                                      type={inputFieldData.type}
                                      className="form__input createpitchdeck__container__content__main__container__actions__form__input"
                                      value={
                                        textInputData
                                          ? textInputData.inputValue
                                          : ""
                                      }
                                      onChange={(event) =>
                                        handleFormInputField(
                                          event,
                                          inputFieldData.key,
                                          event.target.value,
                                          inputFieldData.type
                                        )
                                      }
                                    />
                                  </div>
                                );
                              }
                            )}

                            <TemplateFormActions
                              currentSlideNo={currentSlideNo}
                              onNextSlideClick={onNextSlideClick}
                              onPreviousSlideClick={onPreviousSlideClick}
                              isLastSlide={isLastSlide}
                              timeLeft={formData.footerData.timeLeft}
                              onExportingTemplate={onExportingTemplate}
                            />
                          </form>
                          <p className="paragraph createpitchdeck__container__content__main__container__actions__hint">
                            Don’t worry if you make some changes, you can always
                            come back later.
                          </p>
                        </motion.div>
                      </>
                    ) : (
                      <h1>Saving...</h1>
                    )}
                  </div>
                </div>
              </>
            ) : (
              ""
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default CreatePitchDeck;

const TemplateFormActions = ({
  currentSlideNo,
  onNextSlideClick,
  onPreviousSlideClick,
  isLastSlide,
  timeLeft,
  onExportingTemplate,
}) => {
  return (
    <div className="createpitchdeck__container__content__main__container__actions__form__action">
      {!isLastSlide && (
        <button
          className="button button-md createpitchdeck__container__content__main__container__actions__form__action__submit__primary"
          onClick={onNextSlideClick}
        >
          Next
        </button>
      )}
      {currentSlideNo > 1 && (
        <button
          className="button button-md createpitchdeck__container__content__main__container__actions__form__action__submit"
          onClick={onPreviousSlideClick}
        >
          Prev
        </button>
      )}
      {isLastSlide && (
        <button
          className="button button-md createpitchdeck__container__content__main__container__actions__form__action__submit__primary"
          onClick={onExportingTemplate}
        >
          Export
        </button>
      )}
      <p className="paragraph createpitchdeck__container__content__main__container__actions__form__action__text">
        {timeLeft}
      </p>
    </div>
  );
};

const TemplateSlidePreview = ({ slideInputData, contentData }) => {
  const fileContent =
    slideInputData !== [] &&
    slideInputData.find(
      (inputFieldData) => inputFieldData.inputFieldKey === "IMAGE"
    );
  const mainTextContent = slideInputData.find(
    (inputFieldData) =>
      slideInputData !== [] && inputFieldData.inputFieldKey === "MAIN_TEXT"
  );
  const paragraphContent = slideInputData.find(
    (inputFieldData) =>
      slideInputData !== [] && inputFieldData.inputFieldKey === "PARAGRAPH"
  );

  const { previewLabel } = contentData;
  // inputFieldKey, inputValue, inputType

  return (
    <motion.div
      className="createpitchdeck__container__content__main__container__preview"
      variants={pitchDeckPreviewVariants}
      animate="open"
      initial="hidden"
    >
      <div className="createpitchdeck__container__content__main__container__preview__container">
        <div className="createpitchdeck__container__content__main__container__preview__container__content">
          <div className="createpitchdeck__container__content__main__container__preview__container__content__image">
            {fileContent && (
              <img
                className="createpitchdeck__container__content__main__container__preview__container__content__image__canvas"
                alt="pitch-deck"
                src={fileContent.inputValue}
              />
            )}
          </div>

          <div className="createpitchdeck__container__content__main__container__preview__container__content__main">
            {previewLabel && (
              <h3 className="createpitchdeck__container__content__main__container__preview__container__content__main__heading">
                {previewLabel}
              </h3>
            )}
            {mainTextContent && (
              <h3 className="createpitchdeck__container__content__main__container__preview__container__content__main__subheading">
                {mainTextContent.inputValue}
              </h3>
            )}

            {paragraphContent && (
              <p className="createpitchdeck__container__content__main__container__preview__container__content__main__paragraph">
                {paragraphContent.inputValue}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
