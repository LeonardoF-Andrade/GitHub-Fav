export class Git {
  static search(username) {
    const url = `https://api.github.com/users/${username}`;

    return fetch(url)
      .then((response) => response.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        public_repos,
        followers,
      }));
  }
}

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  async add(username) {
    try {
      const test = this.entries.find((user) => user.login === username);
      if (test) {
        throw new Error("Usuário já adicionado");
      }
      const user = await Git.search(username);

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado");
      }
      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  save() {
    localStorage.setItem("@git-favorites", JSON.stringify(this.entries));
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@git-favorites")) || [];
  }

  delete(username) {
    this.entries = this.entries.filter((user) => user.login !== username);
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("tbody");

    this.update();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector(".search button");

    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input");
      // console.log(value);
      this.add(value);
    };
  }

  update() {
    this.removeAlltr();

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector("img").src = `https://github.com/${user.login}.png`;
      row.querySelector("img").alt = `Imagem do ${user.login}`;
      row.querySelector("a").href = `https://github.com/${user.login}`;
      row.querySelector("a p").textContent = user.name;
      row.querySelector("a span").textContent = `/${user.login}`;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;
      row.querySelector("button").onclick = () => {
        this.delete(user.login);
      };
      this.root.querySelector(".search input").value = "";
      this.tbody.append(row);
    });

    if (this.entries.length === 0) {
      this.createEmptyRow();
    } else {
      this.removeEmptyRow();
    }
  }

  createEmptyRow() {
    const div = document.querySelector("body #empty");
    div.classList.remove("hide");
  }

  removeEmptyRow() {
    const div = document.querySelector("body #empty");
    div.classList.add("hide");
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="user">
        <img src="" alt="" />
        <a href="">
          <p></p>
          <span></span>
        </a>
      </td>
      <td class="repositories"></td>
      <td class="followers"></td>
      <td>
        <button>Remover</button>
      </td>
    `;

    return tr;
  }

  removeAlltr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
