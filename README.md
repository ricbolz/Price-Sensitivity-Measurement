# Overview 概要

This is the program to calculate Price Sensitivity Measurement (PSM) analysis by TypeScript. The input is csv file that contain data of the price survey and the output is the result of PSM Analysis

Caution : It needs ts-node to be installed as global so it able to run the program. You can run the command in the box below to install ts-node as a global environment

TypeScriptでPrice Sensitivity Measurement (PSM)分析 を実装するプログラムである。入力は価格のアンケートデータのcsvファイルであり、出力はそのデータによってPSM分析の結果


注意 : プログラムを実行するためにts-nodeは必要なのでts-nodeは必ずグローバル環境にインストールすること。インストールする方法は下記のコマンドをコマンドラインに実行する
```
npm install -g ts-node
```

# Usage Instruction 使用方法 

Go to the project folder on the command line and run the following command 

コマンドラインでプロジェクトフォルダーに移動して、下記のコマンドを実行する 
```
npm i
ts-node psm.ts --csvfile PSMrawdata
```
