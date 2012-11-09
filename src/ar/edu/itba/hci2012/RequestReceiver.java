package ar.edu.itba.hci2012;

import android.os.Bundle;
import android.os.Handler;
import android.os.ResultReceiver;

public abstract class RequestReceiver extends ResultReceiver {

	public RequestReceiver() {
		super(new Handler());
	}

	public abstract void onStarted();
	
	public abstract void onData(String data);
	
	public abstract void onError(String error);

	@Override
	protected void onReceiveResult(int resultCode, Bundle resultData) {

		switch(resultCode){
		case FlightsAPIService.STARTED:
			onStarted();
			break;
		case FlightsAPIService.DONE:
			if (resultData.containsKey("error")){
				onError(resultData.getString("error"));
				return;
			}
			onData(resultData.getString("response"));
			break;
		}
	}
	
}
