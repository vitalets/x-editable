<?php

class SerieController extends BaseController
{
    public function postQuickUpdate()
    {
        $inputs = Input::all();

        $serie = Serie::find($inputs['pk']);

        $serie->$inputs['name'] = $inputs['value'];
        
        if($serie->save()){
            
            return $serie;
            
        }else{
            
            App::abort(400, 'Error Message.');
            
        }
    }
}

/*
The blade template.
<span class='video-editable' data-emptytext='Click to add YouTube Video' data-type='text' data-url='{{ URL::route('serie/quick_update') }}' data-pk="{{ $serie->id }}" data-name='video'>
    {{ nl2br($serie->video) }}
</span>
*/

/*
JS method
error: function(response, newValue) {
    if(response.status != 200) {
		return JSON.parse(response.responseText).error.message;
	}
},
success: ...
*/
