class Roundups {
  partnerId = "";
  partnerSecret = "";
  token = "";
  refreshToken = "";
  user = {};
  roundups = {};

  /**
   * @description Get the token
   * @author David Barona <dbarona@joonik.com>
   * @date 27/07/2022
   * @memberof Roundups
   */
  async getToken() {
    const response = await fetchRequest("/clients/get-token", "post", {
      partnerId: this.partnerId,
      partnerSecret: this.partnerSecret,
    });

    if (response) {
      const { token, refreshToken } = response;
      this.token = token;
      setTextElement("textToken", token);

      this.refreshToken = refreshToken;
      setTextElement("textRefreshToken", refreshToken);

      msgToast("Generated token", "success");
    } else {
      this.token = "";
      setTextElement("textToken", "");

      this.refreshToken = "";
      setTextElement("textRefreshToken", "");

      msgToast("Invalid credentials", "danger");
    }
  }

  /**
   * @description Register or login user
   * @author David Barona <dbarona@joonik.com>
   * @date 27/07/2022
   * @memberof Roundups
   */
  async loginUser() {
    if (this.token === "") {
      msgToast("Token not generated", "danger");
    } else {
      const response = await fetchRequest(
        "/users/login/user",
        "post",
        {
          email: this.user.email,
          name: this.user.firstName,
          lastName: this.user.lastName,
        },
        {
          "hedge-partner-id": this.partnerId,
          "hedge-token-app": this.token,
        }
      );

      if (response) {
        this.user = response;
        msgToast("The user registered successfully", "success");
      } else {
        msgToast("Failed to register user", "danger");
      }
    }
  }

  /**
   * @description Round Ups activation
   * @author David Barona <dbarona@joonik.com>
   * @date 27/07/2022
   * @memberof Roundups
   */
  async activateRoundUps() {
    if (!this.user._id) {
      msgToast("The user is not logged in", "danger");
    } else {
      const multiplier = document.querySelector(
        'input[name="radioMultiplier"]:checked'
      );
      if (!multiplier) {
        msgToast("You must select a multiplier", "danger");
      } else {
        const response = await fetchRequest(
          "/users",
          "post",
          {
            email: this.user.email,
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            multiplier: multiplier.value,
          },
          {
            "hedge-partner-id": this.partnerId,
            "hedge-token-app": this.token,
          }
        );

        if (response) {
          this.roundups = response;
          if (!response.complete_activation) {
            const responseActivate = await fetchRequest(
              `/users/${this.user._id}/complete-activation`,
              "get",
              {},
              {
                "hedge-partner-id": this.partnerId,
                "hedge-token-app": this.token,
              }
            );

            if (responseActivate) {
              this.user = {
                ...this.user,
                dwollaId: responseActivate.user.dwollaId,
                finicityId: responseActivate.user.finicityId,
                complete_activation: responseActivate.user.complete_activation,
              };
              msgToast("The round up was activated successfully", "success");
            } else {
              msgToast("Failed to activate round up", "danger");
            }
          } else {
            this.user = {
              ...this.user,
              dwollaId: response.dwollaId,
              finicityId: response.finicityId,
            };
            msgToast("The round up was activated successfully", "success");
          }
        } else {
          msgToast("Failed to activate round up", "danger");
        }
      }
    }
  }

  /**
   * @description Counts of banking are added
   * @author David Barona <dbarona@joonik.com>
   * @date 28/07/2022
   * @memberof Roundups
   */
  async addBanking() {
    if (!this.user.user || this.user.complete_activation === false) {
      msgToast(
        "The user has not logged in or their registration has not been completed",
        "danger"
      );
    } else {
      const response = await fetchRequest(
        `/users/${this.user.user}/add-bank-account`,
        "get",
        {},
        {
          "hedge-partner-id": this.partnerId,
          "hedge-token-app": this.token,
        }
      );

      if (response) {
        if (response.is_plaid) {
          // Plaid
          const handler = Plaid.create({
            token: response.link_token,
            onSuccess: (public_token, metadate) => {
              console.log("success ", public_token);
              console.log("metadate ", metadate);
              this.dataPlaid.public_token = public_token;
              this.dataPlaid.nmetadate = metadate;
            },
            onLoad: () => {
              console.log("onload ");
            },
            onExit: (err, metadata) => {
              console.log("exit ", err);
            },
            onEvent: (eventName, metadata) => {
              console.log("onevent ", eventName);
            },
          });
          handler.open();
        } else {
          // Finicity
          window.open(
            response.url,
            "popUpWindow",
            "height=500,width=900,left=50,top=50,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes"
          );
        }
      } else {
        msgToast("Failed to add account", "danger");
      }
    }
  }

  /**
   * @description Get user transactions
   * @author David Barona <dbarona@joonik.com>
   * @date 29/07/2022
   * @memberof Roundups
   */
  async getTransactions() {
    const responseTransactions = document.querySelector(
      "#responseTransactions > tbody"
    );
    responseTransactions.classList.remove("text-danger");

    if (!this.user.user) {
      responseTransactions.classList.add("text-danger");
      responseTransactions.innerHTML = "The user has not logged in";
    } else {
      responseTransactions.innerHTML = "Loading...";
      const response = await fetchRequest(
        `/users/${this.user.user}/transactions?page=1`,
        "get",
        {},
        {
          "hedge-partner-id": this.partnerId,
          "hedge-token-app": this.token,
        }
      );

      if (response) {
        if (response.userTransaction.length == 0) {
          responseTransactions.innerHTML = "No transactions found";
        } else {
          const balanceText = document.getElementById("balanceText");

          const responseBalance = await fetchRequest(
            `/users/${this.user.user}/balance`,
            "get",
            {},
            {
              "hedge-partner-id": this.partnerId,
              "hedge-token-app": this.token,
            }
          );

          if (responseBalance) {
            balanceText.innerHTML = responseBalance.balance;
          }

          let cadena = "";
          response.userTransaction.forEach((item) => {
            cadena += `<tr>
                  <td>${item.bank_transaction_id}</td>
                  <td>${item.relUserClient}</td>
                  <td>${item.original_amount}</td>
                  <td>${item.amount_added_to_roundups}</td>
                  <td>${item.posted_date}</td>
                </tr>`;
          });

          responseTransactions.innerHTML = cadena;
        }
      } else {
        msgToast("Failed to get transactions", "danger");
      }
    }
  }

  /**
   * @description Get user bankings
   * @author David Barona <dbarona@joonik.com>
   * @date 29/07/2022
   * @memberof Roundups
   */
  async getBankings() {
    const responseBankings = document.querySelector(
      "#responseBankings > tbody"
    );
    responseBankings.classList.remove("text-danger");

    if (!this.user.user) {
      responseBankings.classList.add("text-danger");
      responseBankings.innerHTML = "The user has not logged in";
    } else {
      responseBankings.innerHTML = "Loading...";
      const response = await fetchRequest(
        `/users/${this.user._id}/banking`,
        "get",
        {},
        {
          "hedge-partner-id": this.partnerId,
          "hedge-token-app": this.token,
        }
      );

      if (response) {
        if (response.listAccount.length == 0) {
          responseBankings.innerHTML = "No bank accounts found";
        } else {
          let cadena = "";
          response.listAccount.forEach((item) => {
            cadena += `<tr>
                  <td>${item.idClientUser}</td>
                  <td>${item.typeAccount}</td>
                  <td>${item.accountNumber}</td>
                  <td>${item.institutionLoginId}</td>
                  <td>${item.date}</td>
                  <td><a href="#" onclick="event.preventDefault(); roundups.createTransactions('${item.idAccount}')"
                    >
                    Create transaction
                </a></td>
                </tr>`;
          });

          responseBankings.innerHTML = cadena;
        }
      } else {
        msgToast("Failed to get bankings", "danger");
        responseBankings.innerHTML = "";
      }
    }
  }

  /**
   * @description
   * @author David Barona <davidfbarona@gmail.com>
   * @date 03/08/2022
   * @memberof Roundups
   */
  async createTransactions(id = false) {
    if (!this.user.user || !id) {
      msgToast("The user has not logged in", "danger");
    } else {
      const response = await fetchRequest(
        `/test/generate-transaction/${this.user.user}/${id}`,
        "get",
        {},
        {
          "hedge-partner-id": this.partnerId,
          "hedge-token-app": this.token,
        },
        true
      );

      if (response) {
        msgToast("Transaction created successfully", "success");
      } else {
        msgToast("Failed to create transaction", "danger");
      }
    }
  }
}

let roundups = new Roundups();
