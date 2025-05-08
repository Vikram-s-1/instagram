pipeline {
  agent any

  environment {
    REGISTRY = "<trialfj6own.jfrog.io/docker-local/instagram-clone:lates"
    IMAGE = "instagram-clone:${BUILD_NUMBER}"
  }

  stages {
    stage('Clone Repo') {
      steps {
        git 'https://github.com/Vikram-s-1/instagram.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $REGISTRY/$IMAGE .'
      }
    }

    stage('Push Image to JFrog') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'jfrog-creds', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
          sh '''
            docker login -u $USERNAME -p $PASSWORD <jfrog-url>
            docker push $REGISTRY/$IMAGE
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh 'kubectl set image deployment/instagram-app instagram-app=$REGISTRY/$IMAGE --record'
      }
    }
  }
}

