# Laravel Auto Blade VS Code Extension

## Introduction

Welcome to the Laravel Auto blade VS Code Extension! This extension is designed to supercharge Laravel developer productivity by converting HTML files to Blade templates. It automatically changes all files with a `.html` extension to `.blade.php` and updates necessary content like links to asset files using Laravel's `asset()` helper function.

## Features

- Automatically convert `.html` files to `.blade.php` files.
- Automatically update all necessary HTML content to use Laravel's `asset()` helper function, ensuring that the Blade file runs correctly without errors..
- Enhance Laravel development workflow within VS Code.

## Installation and Usage

**Note:** This extension is currently under development. To test and use the extension locally, follow these steps:

1. **Clone the repository**: Clone the repository to your local machine using:
   ```sh
   git clone https://github.com/your-username/laravel-blade-converter.git

2. **Open the `/autoblade` folder**: Be sure to open the `/autoblade` folder inside the cloned repository with VS Code.
    ```sh	
    cd laravel-blade-converter/autoblade
    code .

3. **Install dependencies**: Run `npm install` to install the necessary dependencies.

4. **Run the extension**: Press `F5` to open a new VS Code window with the extension loaded.

5. **Test the extension**: Press ``ctrl+shift+p`` to open the command palette and type `Auto Blade` to convert the current opened HTML file to a Blade template.

<!-- ## Usage

This extension is currently under development -->
<!-- 1. Open any `.html` file in your VS Code workspace.
2. The extension will automatically convert the file to a `.blade.php` file and update asset links. -->

## Community Guidelines

We are excited to have you contribute to this project! To ensure a smooth and productive collaboration, please follow these guidelines:

- Be respectful and considerate of others.
- Use inclusive language.
- Provide constructive feedback.
- Follow the code of conduct.

## How to Contribute

We welcome contributions from everyone. Here’s how you can get started:

1. **Fork the repository**: Click the "Fork" button at the top of this repository to create a copy of the repository on your GitHub account.
2. **Clone the repository**: Clone your forked repository to your local machine using `git clone https://github.com/your-username/laravel-blade-converter.git`.
3. **Create a branch**: Create a new branch for your feature or bug fix using `git checkout -b your-branch-name`.
4. **Make your changes**: Make your changes to the codebase.
5. **Commit your changes**: Commit your changes with a clear and descriptive commit message using `git commit -m "Your commit message"`.
6. **Push to the branch**: Push your changes to your forked repository using `git push origin your-branch-name`.
7. **Create a Pull Request**: Open a pull request to the main repository. Provide a clear description of your changes and why they are necessary.

## Resources

For those new to VS Code extension development, here are some useful guides to get you started:

- [Visual Studio Code Extension API](https://code.visualstudio.com/api)
    The visual studio code API allow you to interact with the vscode editor and its native features and behaviors.
    It is the utimate guide to creating vscode extensions. Really encourage you guys to get a look at it.
- [Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)

## Code of Conduct

We expect all contributors to adhere to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct/). Please read it to understand the expectations for behavior in our community.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

If you have any questions or need further assistance, feel free to open an issue or contatct me at <souroagorouko@gmail.com>.

Happy coding!