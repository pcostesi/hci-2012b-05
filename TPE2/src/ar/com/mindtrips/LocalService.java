package ar.com.mindtrips;

import android.app.IntentService;
import android.content.Intent;


public class LocalService extends IntentService {
    
	public LocalService(String name) {
		super(LocalService.class.getSimpleName());
	}

	@Override
	protected void onHandleIntent(Intent intent) {
		// TODO Auto-generated method stub
		
	}

}