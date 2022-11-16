const BASE_URL_API = "https://sandbox.hedgepayments.com";
const PREFIX_URL_API = BASE_URL_API + "/api/v1";

/**
 * @description Print a message
 * @author David Barona <dbarona@joonik.com>
 * @date 27/07/2022
 * @param {string} [text=""]
 * @param {string} [type="success"]
 */
const msgToast = (text = "", type = "success") => {
  const option = {
    animation: true,
    delay: 2000,
    autohide: true,
  };

  setTextElement("msgTextToast", text);
  const msgToast = document.getElementById("msgToast");
  ["danger", "info", "success"].map((typeMsg) => {
    msgToast.classList.remove("bg-" + typeMsg);
  });

  msgToast.classList.add("bg-" + type);
  const toastElement = new bootstrap.Toast(msgToast, option);
  toastElement.show();
};

/**
 * @description Sets a text in an HTML element
 * @author David Barona <dbarona@joonik.com>
 * @date 27/07/2022
 * @param {*} text
 * @param {*} value
 */
const setTextElement = (text, value) => {
  const element = document.getElementById(text);
  element.innerHTML = value;
};

/**
 * @description Make a request to an API using axios
 * @author David Barona <dbarona@joonik.com>
 * @date 27/07/2022
 * @param {*} url
 * @param {string} [method="get"]
 * @param {*} data
 * @param {*} headers
 * @return {*}
 */
const fetchRequest = async (
  url,
  method = "get",
  data = {},
  headers = {},
  external = false
) => {
  try {
    const response = await axios({
      url: external ? BASE_URL_API + url : PREFIX_URL_API + url,
      method: method,
      data,
      headers,
    });
    console.log(response);
    return response.data;
  } catch (error) {
    return false;
  }
};

/**
 * @description The data entered in the form for the token is validated
 * @author David Barona <dbarona@joonik.com>
 * @date 27/07/2022
 * @param {*} roundups
 */
const validateToken = (roundups) => {
  const btnGetToken = document.getElementById("btnGetToken");
  if (roundups.partnerId !== "" && roundups.partnerSecret !== "") {
    btnGetToken.removeAttribute("disabled");
  } else {
    btnGetToken.setAttribute("disabled", true);
  }
};

/**
 * @description The data entered in the form for the user is validated
 * @author David Barona <dbarona@joonik.com>
 * @date 27/07/2022
 * @param {*} roundups
 */
const validateUser = (roundups) => {
  const reEmail =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const btnRegisterUser = document.getElementById("btnRegisterUser");
  const { firstName, lastName, email } = roundups.user;
  if (
    email !== "" &&
    reEmail.test(String(email).toLowerCase()) &&
    firstName !== "" &&
    lastName !== ""
  ) {
    btnRegisterUser.removeAttribute("disabled");
  } else {
    btnRegisterUser.setAttribute("disabled", true);
  }
};
