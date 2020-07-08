#pragma once

#include <QObject>
#include <QDebug>
#include <QNetworkRequest>
#include <QNetworkAccessManager>
#include <QUrlQuery>
#include <QByteArray>
#include <QNetworkReply>
#include <QJsonDocument>
#include "definitions.h"


namespace ETClient
{
    class AuthModel : public QObject
    {
        Q_OBJECT
    private:
        QUrl* host;
        QNetworkAccessManager* reqManager;
        QString authToken;

        void setToken(const QString& value);

    private slots:
        void onAuthRequestFinish(QNetworkReply* reply);

    signals:
        void authorizationSuccessful();
        void invalidCredentials();
    public:
        explicit AuthModel(QObject* parent = nullptr);
        ~AuthModel();

        void authorize(QString username, QString password);
        QString getToken()const;
    };
}
