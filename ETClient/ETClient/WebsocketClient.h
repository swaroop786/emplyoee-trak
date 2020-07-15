#pragma once

#include <QObject>
#include <QUrl>
#include <QDebug>
#include <QWebSocket>
#include <QNetworkAccessManager>
#include <QJsonDocument>
#include <QJsonObject>
#include "definitions.h"

namespace ETClient
{
    class WebsocketClient: public QObject
    {
        Q_OBJECT
    private:
        const QUrl* host;
        bool debug;
        QWebSocket ws;
    private slots:
        void onConnected();
        void onDisconnected();
        void onTextMessageReceived(const QString& message);
    signals:
        void connected();
        void disconnected();
        void textMessageReceived(const QString& message);
    public:
        WebsocketClient(QObject* parent = nullptr, bool debug = false);
        ~WebsocketClient();
        void connectClient(const QString& token);
        void disconnectClient();
        void sendMessage(const QJsonObject& message);
        void sendMessage(const QByteArray& message);
    };
}