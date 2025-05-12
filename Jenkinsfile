pipeline {
  agent any

  environment {
    REGISTRY = "trialfj6own.jfrog.io/docker-local"
    IMAGE = "instagram-app:${BUILD_NUMBER}"
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

    stage('Push to JFrog Artifactory') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'jfrog-creds', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
          sh '''
            docker login -u $USERNAME -p $PASSWORD trialfj6own.jfrog.io
            docker push $REGISTRY/$IMAGE
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          sh 'kubectl set image deployment/instagram-app instagram-app=trialfj6own.jfrog.io/virtual-docker-repo/instagram-app:${BUILD_NUMBER} --record'
        }
      }
    }
  }
}

